use actix_web::{get, web, HttpResponse};
use chrono::{Duration, Utc};
use sqlx::{Pool, Sqlite};

use crate::api::export::all::ExportRequestReadDTO;
use crate::api::export::handlers::ExportQuery;
use crate::api::resource_access_token::ResourceAccessClaims;
use crate::api::FORBIDDEN_ERROR_TEXT;
use crate::db::export::{get_exportable, get_exportable_reading_ids};
use crate::extractors::{ExportPerms, VerifiedAuthInfo};
use crate::types::HandlerResult;

#[allow(clippy::expect_used)]
#[get("/request")]
pub async fn handler_get_export_request(
    pool: web::Data<Pool<Sqlite>>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ExportPerms::All.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let dao = get_exportable_reading_ids(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let count: i64 = dao
        .image_ids
        .len()
        .try_into()
        .expect("Impossible error: Unable to convert usize to i64");

    let now = Utc::now();
    let export_token = ResourceAccessClaims {
        sub: vai.jwt_claims.auth0_id,
        aud: String::from("all.png"),
        exp: now
            .checked_add_signed(Duration::seconds(30 * count))
            .expect("Impossible error: Time overflowed when generating export_token")
            .timestamp(),
        iat: now.timestamp(),
    }
    .get_token();

    Ok(HttpResponse::Ok().json(ExportRequestReadDTO {
        export_token,
        image_ids: dao.image_ids,
    }))
}

#[get("/json")]
pub async fn handler_get_exportable_json(
    pool: web::Data<Pool<Sqlite>>,
    url_params: web::Query<ExportQuery>,
) -> HandlerResult {
    if let Err(error_msg) =
        ResourceAccessClaims::validate_token(&url_params.export_token, "all.png")
    {
        return Err(actix_web::error::ErrorBadRequest(error_msg));
    }

    let result = get_exportable(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(result))
}
