use std::collections::HashSet;
use std::io::{Read, Write};

use actix_easy_multipart::extractor::MultipartForm;
use actix_web::{delete, get, post, put};
use actix_web::{web, HttpResponse};
use chrono::{Duration, Utc};
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

use crate::api::electricity_readings::{
    ElectricityReadingCreateMultipartForm, ElectricityReadingReadFullDTO,
    ElectricityReadingUpdateMultipartForm,
};
use crate::api::resource_access_token::ResourceAccessClaims;
use crate::api::FORBIDDEN_ERROR_TEXT;
use crate::db::electricity_readings::{
    create_electricity_reading, delete_electricity_reading, get_all_electricity_readings,
    get_electricity_reading, get_electricity_readings_between,
    get_latest_electricity_reading_millis, update_electricity_reading,
};
use crate::extractors::{ElectricityReadingPerms, VerifiedAuthInfo};
use crate::types::HandlerResult;

fn save_image(image: actix_easy_multipart::File) -> Result<String, std::io::Error> {
    let uploaded_img_ext = image
        .get_extension()
        .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::Other, "Image has no filename"))?;
    let img_path_in_original_temp =
        format!("./images/original/{}.{}", Uuid::new_v4(), uploaded_img_ext);
    let mut img_file_in_original = std::fs::File::create(&img_path_in_original_temp)?;

    let mut image_bytes: Vec<u8> = Vec::new();
    for byte in image.file.bytes() {
        image_bytes.push(byte?);
    }
    img_file_in_original.write_all(image_bytes.as_slice())?;
    Ok(img_path_in_original_temp)
}

/// 1. Save into ./images/original
/// 2. Compress (if needed) and save into ./images/compressed
/// 3. Delete temporary image in ./images/original
fn compress_save_cleanup(
    img_path_in_original_temp: String,
    new_id: i64,
) -> Result<(), std::io::Error> {
    let image = image::io::Reader::open(img_path_in_original_temp.clone())?
        .decode()
        .map_err(|image_error| std::io::Error::new(std::io::ErrorKind::Other, image_error))?;

    let img_path_in_original = format!("./images/original/{}.png", new_id);
    image
        .save_with_format(img_path_in_original, image::ImageFormat::Png)
        .map_err(|image_error| std::io::Error::new(std::io::ErrorKind::Other, image_error))?;

    let img_path_in_compressed = format!("./images/compressed/{}.jpg", new_id);
    if image.width() <= image.height() {
        // portrait / square
        if image.width() > 1080 || image.height() > 1920 {
            image
                .resize(1080, 1920, image::imageops::FilterType::Triangle)
                .save_with_format(img_path_in_compressed, image::ImageFormat::Jpeg)
                .map_err(|image_error| {
                    std::io::Error::new(std::io::ErrorKind::Other, image_error)
                })?;
        } else {
            image
                .save_with_format(img_path_in_compressed, image::ImageFormat::Jpeg)
                .map_err(|image_error| {
                    std::io::Error::new(std::io::ErrorKind::Other, image_error)
                })?;
        }
    } else {
        // landscape
        if image.width() > 1920 || image.height() > 1080 {
            image
                .resize(1920, 1080, image::imageops::FilterType::Triangle)
                .save_with_format(img_path_in_compressed, image::ImageFormat::Jpeg)
                .map_err(|image_error| {
                    std::io::Error::new(std::io::ErrorKind::Other, image_error)
                })?;
        } else {
            image
                .save_with_format(img_path_in_compressed, image::ImageFormat::Jpeg)
                .map_err(|image_error| {
                    std::io::Error::new(std::io::ErrorKind::Other, image_error)
                })?;
        }
    }

    std::fs::remove_file(img_path_in_original_temp)?;

    Ok(())
}

fn validate_reading(reading: f64, field_name: &str) -> Result<f64, String> {
    if reading < 0_f64 {
        return Err(format!("{} is negative", field_name));
    }
    let trunc = f64::trunc(reading * 10_f64) / 10_f64;
    if (trunc - reading).abs() >= f64::EPSILON {
        return Err(format!("{} has more than 1 d.p.", field_name));
    }
    if reading >= 100_000_f64 {
        return Err(format!("{} is too big", field_name));
    }
    Ok(trunc)
}

/**
 * Main code here courtesy of
 * https://github.com/actix/examples/blob/master/forms/multipart/src/main.rs
 */
#[post("")]
pub async fn handler_create_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    form: MultipartForm<ElectricityReadingCreateMultipartForm>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ElectricityReadingPerms::Create.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let low_kwh =
        validate_reading(form.0.low_kwh, "low_kwh").map_err(actix_web::error::ErrorBadRequest)?;
    let normal_kwh = validate_reading(form.0.normal_kwh, "normal_kwh")
        .map_err(actix_web::error::ErrorBadRequest)?;

    // Save image to ./images/original
    // This step is actually pretty fast
    let img_path_in_original_temp = web::block(|| save_image(form.0.image)).await??;

    // Database access
    let new_reading_id =
        create_electricity_reading(&pool, low_kwh, normal_kwh, vai.jwt_claims.auth0_id)
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;

    // Save into ./images/original
    // Compress (if needed) and save into ./images/compressed
    // Delete temporary image in ./images/original
    // This step is slow!
    web::block(move || compress_save_cleanup(img_path_in_original_temp, new_reading_id)).await??;

    Ok(HttpResponse::Created().json(new_reading_id))
}

#[derive(Deserialize)]
pub struct GetElectricityReadingsQueryParams {
    start_unix_ts_millis_inc: Option<i64>,
    end_unix_ts_millis_inc: Option<i64>,
}

#[get("")]
pub async fn handler_get_electricity_readings(
    pool: web::Data<Pool<Sqlite>>,
    query_params: web::Query<GetElectricityReadingsQueryParams>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ElectricityReadingPerms::Read.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    match (
        query_params.start_unix_ts_millis_inc,
        query_params.end_unix_ts_millis_inc,
    ) {
        (None, None) => {
            let result = get_all_electricity_readings(&pool)
                .await
                .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(result))
        }
        (start, end) => {
            let result = get_electricity_readings_between(
                &pool,
                start.unwrap_or(std::i64::MIN),
                end.unwrap_or(std::i64::MAX),
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(result))
        }
    }
}

#[allow(clippy::expect_used)]
#[get("/{reading_id}")]
pub async fn handler_get_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<i64>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ElectricityReadingPerms::Read.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    let result = get_electricity_reading(&pool, path)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    match result {
        Some(dao) => {
            let now = Utc::now();
            let image_token = ResourceAccessClaims {
                sub: vai.jwt_claims.auth0_id,
                aud: format!("{}.jpg", path),
                exp: now
                    .checked_add_signed(Duration::minutes(1))
                    .expect("Impossible error: Time overflowed when generating image_token")
                    .timestamp(),
                iat: now.timestamp(),
            }
            .get_token();
            Ok(HttpResponse::Ok().json(ElectricityReadingReadFullDTO {
                id: dao.id,
                low_kwh: dao.low_kwh,
                normal_kwh: dao.normal_kwh,
                creation_unix_ts_millis: dao.creation_unix_ts_millis,
                creator_name: dao.creator_name,
                creator_email: dao.creator_email,
                latest_modification_unix_ts_millis: dao.latest_modification_unix_ts_millis,
                latest_modifier_name: dao.latest_modifier_name,
                latest_modifier_email: dao.latest_modifier_email,
                image_token,
            }))
        }
        None => Ok(HttpResponse::NotFound().finish()),
    }
}

#[get("/latest")]
pub async fn handler_get_latest_electricity_reading_millis(
    pool: web::Data<Pool<Sqlite>>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_any_of_these_permissions(&HashSet::from([
        ElectricityReadingPerms::Create.to_string(),
        ElectricityReadingPerms::Read.to_string(),
    ])) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let result = get_latest_electricity_reading_millis(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    match result {
        Some(millis) => Ok(HttpResponse::Ok().json(millis)),
        None => Ok(HttpResponse::NotFound().finish()),
    }
}

#[put("/{reading_id}")]
pub async fn handler_update_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<i64>,
    form: MultipartForm<ElectricityReadingUpdateMultipartForm>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ElectricityReadingPerms::Update.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    let low_kwh =
        validate_reading(form.0.low_kwh, "low_kwh").map_err(actix_web::error::ErrorBadRequest)?;
    let normal_kwh = validate_reading(form.0.normal_kwh, "normal_kwh")
        .map_err(actix_web::error::ErrorBadRequest)?;

    // Save image to ./images/original if present
    let img_path_in_original_temp: Option<String> = match form.0.image {
        Some(image) => Some(web::block(|| save_image(image)).await??),
        None => None,
    };

    // Database access
    update_electricity_reading(&pool, path, low_kwh, normal_kwh, vai.jwt_claims.auth0_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    if let Some(img_path_in_original_temp) = img_path_in_original_temp {
        // Save into ./images/original
        // Compress (if needed) and save into ./images/compressed
        // Delete temporary image in ./images/original
        web::block(move || compress_save_cleanup(img_path_in_original_temp, path)).await??;
    }

    Ok(HttpResponse::NoContent().finish())
}

#[delete("/{reading_id}")]
pub async fn handler_delete_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<i64>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ElectricityReadingPerms::Delete.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    // Ensure that record exists (not deleted)
    let result = get_electricity_reading(&pool, path)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    if result.is_none() {
        return Ok(HttpResponse::NotFound().finish());
    }

    delete_electricity_reading(&pool, path, vai.jwt_claims.auth0_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    // Delete image (from compressed folder only)
    // std::fs::remove_file(format!("./images/original/{}.png", path))?;
    std::fs::remove_file(format!("./images/compressed/{}.jpg", path))?;
    std::fs::rename(
        format!("./images/original/{}.png", path),
        format!("./images/original/{}_tombstone.png", path),
    )?;

    Ok(HttpResponse::NoContent().finish())
}
