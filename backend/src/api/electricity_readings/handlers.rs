use actix_web::{get, post};
use actix_web::{web, HttpResponse};

use crate::db::electricity_readings::{create_electricity_reading, get_all_electricity_readings};
use crate::db::types::Pool;
use crate::types::AWError;

use super::ElectricityReadingCreateDTO;

#[get("")]
pub async fn handler_get_all_electricity_readings(
    pool: web::Data<Pool>,
) -> Result<HttpResponse, AWError> {
    let result = get_all_electricity_readings(&pool).await?;
    Ok(HttpResponse::Ok().json(result))
}

#[post("")]
pub async fn handler_create_electricity_reading(
    pool: web::Data<Pool>,
    dto: web::Json<ElectricityReadingCreateDTO>,
) -> Result<HttpResponse, AWError> {
    let result = create_electricity_reading(&pool, dto.into_inner()).await?;
    Ok(HttpResponse::Ok().json(result))
}
