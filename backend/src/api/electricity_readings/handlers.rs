use actix_web::{get, post};
use actix_web::{web, HttpResponse};
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::ElectricityReadingCreateDTO;
use crate::db::electricity_readings::{create_electricity_reading, get_all_electricity_readings};
use crate::types::HandlerResult;

#[get("")]
pub async fn handler_get_all_electricity_readings(pool: web::Data<Pool<Sqlite>>) -> HandlerResult {
    let result = get_all_electricity_readings(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(result))
}

#[post("")]
pub async fn handler_create_electricity_reading(
    pool: web::Data<Pool<Sqlite>>,
    dto: web::Json<ElectricityReadingCreateDTO>,
) -> HandlerResult {
    let result = create_electricity_reading(&pool, dto.into_inner())
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(result))
}
