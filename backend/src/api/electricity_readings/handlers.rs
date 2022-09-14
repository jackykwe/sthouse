use std::collections::HashSet;
use std::io::{Read, Write};

use actix_easy_multipart::extractor::MultipartForm;
use actix_web::{delete, get, post, put};
use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

use crate::api::electricity_readings::{
    ElectricityReadingCreateMultipartForm, ElectricityReadingUpdateMultipartForm,
};
use crate::api::FORBIDDEN_ERROR_TEXT;
use crate::db::electricity_readings::{
    create_electricity_reading, delete_electricity_reading, get_all_electricity_readings,
    get_electricity_reading, get_electricity_readings_between, update_electricity_reading,
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
    if !vai.has_permissions(&HashSet::from(
        [ElectricityReadingPerms::Create.to_string()],
    )) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    // Save image to ./images/original
    let img_path_in_original_temp = web::block(|| save_image(form.0.image)).await??;

    // Database access
    let new_reading_id = create_electricity_reading(
        &pool,
        form.0.low_kwh,
        form.0.normal_kwh,
        vai.jwt_claims.auth0_id,
        vai.given_name.unwrap_or(vai.name),
        vai.email,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    // Save into ./images/original
    // Compress (if needed) and save into ./images/compressed
    // Delete temporary image in ./images/original
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
    if !vai.has_permissions(&HashSet::from([ElectricityReadingPerms::Read.to_string()])) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    match (
        query_params.start_unix_ts_millis_inc,
        query_params.end_unix_ts_millis_inc,
    ) {
        (None, None) => {
            let result = get_all_electricity_readings(
                &pool,
                vai.jwt_claims.auth0_id,
                vai.given_name.unwrap_or(vai.name),
                vai.email,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(result))
        }
        (start, end) => {
            let result = get_electricity_readings_between(
                &pool,
                start.unwrap_or(std::i64::MIN),
                end.unwrap_or(std::i64::MAX),
                vai.jwt_claims.auth0_id,
                vai.given_name.unwrap_or(vai.name),
                vai.email,
            )
            .await
            .map_err(actix_web::error::ErrorInternalServerError)?;
            Ok(HttpResponse::Ok().json(result))
        }
    }
}

#[get("/{reading_id}")]
pub async fn handler_get_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    path: web::Path<i64>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_permissions(&HashSet::from([ElectricityReadingPerms::Read.to_string()])) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    let result = get_electricity_reading(
        &pool,
        path,
        vai.jwt_claims.auth0_id,
        vai.given_name.unwrap_or(vai.name),
        vai.email,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;
    match result {
        Some(dto) => Ok(HttpResponse::Ok().json(dto)),
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
    if !vai.has_permissions(&HashSet::from(
        [ElectricityReadingPerms::Update.to_string()],
    )) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    // Save image to ./images/original if present
    let img_path_in_original_temp: Option<String> = match form.0.image {
        Some(image) => Some(web::block(|| save_image(image)).await??),
        None => None,
    };

    // Database access
    update_electricity_reading(
        &pool,
        path,
        form.0.low_kwh,
        form.0.normal_kwh,
        vai.jwt_claims.auth0_id,
        vai.given_name.unwrap_or(vai.name),
        vai.email,
    )
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
    if !vai.has_permissions(&HashSet::from(
        [ElectricityReadingPerms::Delete.to_string()],
    )) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let path = path.into_inner();

    // Ensure that record exists (not deleted)
    let result = get_electricity_reading(
        &pool,
        path,
        vai.jwt_claims.auth0_id.clone(),
        vai.given_name.clone().unwrap_or_else(|| vai.name.clone()),
        vai.email.clone(),
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;
    if result.is_none() {
        return Ok(HttpResponse::NotFound().finish());
    }

    delete_electricity_reading(
        &pool,
        path,
        vai.jwt_claims.auth0_id,
        vai.given_name.unwrap_or(vai.name),
        vai.email,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    // Delete image (from compressed folder only)
    // Ignore errors
    std::fs::remove_file(format!("./images/original/{}.png", path))?;
    std::fs::remove_file(format!("./images/compressed/{}.jpg", path))?;

    Ok(HttpResponse::NoContent().finish())
}
