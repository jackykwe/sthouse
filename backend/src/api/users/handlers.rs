use actix_web::{get, web, HttpResponse};
use sqlx::{Pool, Sqlite};

use crate::db::users::get_all_users;
use crate::types::{CEReport, HandlerResult};

#[get("")]
pub async fn handler_get_all_users(pool: web::Data<Pool<Sqlite>>) -> HandlerResult {
    let result = get_all_users(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    // let result = dies()?;
    Ok(HttpResponse::Ok().json(result))
}

fn dies() -> Result<String, actix_web::error::Error> {
    Err(actix_web::error::ErrorInternalServerError("shit"))
}
