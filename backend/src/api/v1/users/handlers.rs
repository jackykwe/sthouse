use actix_web::{get, put, web, HttpResponse};
use sqlx::{Pool, Sqlite};

use crate::db::users::{get_user, update_user};
use crate::extractors::VerifiedAuthInfo;
use crate::types::HandlerResult;

use super::UserUpdateDTO;

/// Get own profile
#[get("")]
pub async fn handler_get_user(
    pool: web::Data<Pool<Sqlite>>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    let result = get_user(&pool, vai.jwt_claims.auth0_id)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::Ok().json(result))
}

/// Modify own profile: only allowed operation is editing their display name
#[put("")]
pub async fn handler_update_user(
    pool: web::Data<Pool<Sqlite>>,
    dto: web::Json<UserUpdateDTO>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    update_user(&pool, vai.jwt_claims.auth0_id, dto.0.new_display_name)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    Ok(HttpResponse::NoContent().finish())
}
