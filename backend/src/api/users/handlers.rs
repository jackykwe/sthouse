use actix_web::get;
use actix_web::{web, HttpResponse};

use crate::db::types::Pool;
use crate::db::users::get_all_users;
use crate::types::AWError;

#[get("")]
pub async fn handler_get_all_users(pool: web::Data<Pool>) -> Result<HttpResponse, AWError> {
    let result = get_all_users(&pool).await?;
    Ok(HttpResponse::Ok().json(result))
}
