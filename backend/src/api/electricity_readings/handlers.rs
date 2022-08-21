use actix_web::{get, post};
use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::ElectricityReadingCreateDTO;
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
