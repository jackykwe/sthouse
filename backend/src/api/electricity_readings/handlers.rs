use std::io::{Read, Write};

use actix_easy_multipart::extractor::MultipartForm;
use actix_web::{get, post};
use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::{Pool, Sqlite};
use uuid::Uuid;

use crate::api::electricity_readings::ElectricityReadingCreateMultipartForm;
use crate::db::electricity_readings::{
    create_electricity_reading, get_all_electricity_readings, get_electricity_readings_between,
};
use crate::types::HandlerResult;

#[derive(Deserialize)]
pub struct GetElectricityReadingsQueryParams {
    start_unix_ts_millis_inc: Option<i64>,
    end_unix_ts_millis_inc: Option<i64>,
}

#[get("")]
pub async fn handler_get_electricity_readings(
    pool: web::Data<Pool<Sqlite>>,
    query_params: web::Query<GetElectricityReadingsQueryParams>,
) -> HandlerResult {
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

fn compress_and_save(img_path_in_original: String, new_id: i64) -> Result<(), std::io::Error> {
    let image = image::io::Reader::open(img_path_in_original)?
        .decode()
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
) -> HandlerResult {
    // Save image to ./images/original
    let uploaded_img_ext =
        String::from(form.0.image.get_extension().ok_or_else(|| {
            std::io::Error::new(std::io::ErrorKind::Other, "Image has no filename")
        })?);
    let img_path_in_original_temp = web::block(|| save_image(form.0.image)).await??;

    // Database access
    let new_reading_id = create_electricity_reading(
        &pool,
        form.0.low_kwh,
        form.0.normal_kwh,
        form.0.creator_name,
        form.0.creator_email,
    )
    .await
    .map_err(actix_web::error::ErrorInternalServerError)?;

    // Rename image in ./images/original
    let img_path_in_original = format!("./images/original/{}.{}", new_reading_id, uploaded_img_ext);
    std::fs::rename(img_path_in_original_temp, &img_path_in_original)?;

    // Compress (if needed) and save into ./images/compressed
    web::block(move || compress_and_save(img_path_in_original, new_reading_id)).await??;

    Ok(HttpResponse::Ok().json(new_reading_id))
}
