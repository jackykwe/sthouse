use actix_web::{get, web, HttpResponse};
use chrono::{Duration, Utc};
use sqlx::{Pool, Sqlite};

use crate::api::v1::export::handlers::ExportQuery;
use crate::api::v1::export::historical::HistoricalExportRequestReadDTO;
use crate::api::v1::resource_access_token::ResourceAccessClaims;
use crate::api::v1::FORBIDDEN_ERROR_TEXT;
use crate::db::export::{get_exportable_historical, get_exportable_historical_reading_ids};
use crate::extractors::{ExportPerms, VerifiedAuthInfo};
use crate::types::HandlerResult;

#[allow(clippy::expect_used)]
#[get("/request")]
pub async fn handler_get_historical_export_request(
    pool: web::Data<Pool<Sqlite>>,
    vai: VerifiedAuthInfo,
) -> HandlerResult {
    if !vai.has_this_permission(&ExportPerms::Historical.to_string()) {
        return Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT));
    }

    let dao = get_exportable_historical_reading_ids(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let count: i64 = (dao.image_ids_and_modification_counts.len()
        + dao.tombstone_image_ids_and_modification_counts.len())
    .try_into()
    .expect("Impossible error: Unable to convert usize to i64");

    let now = Utc::now();
    let export_token = ResourceAccessClaims {
        sub: vai.jwt_claims.auth0_id,
        aud: String::from("historical.png"),
        exp: now
            .checked_add_signed(Duration::seconds(30 + 30 * count)) // initial 30 if count == 0
            .expect("Impossible error: Time overflowed when generating export_token")
            .timestamp(),
        iat: now.timestamp(),
    }
    .get_token();

    Ok(HttpResponse::Ok().json(HistoricalExportRequestReadDTO {
        export_token,
        image_ids_and_modification_counts: dao.image_ids_and_modification_counts,
        tombstone_image_ids_and_modification_counts: dao
            .tombstone_image_ids_and_modification_counts,
    }))
}

#[get("/json")]
pub async fn handler_get_historical_exportable_json(
    pool: web::Data<Pool<Sqlite>>,
    url_params: web::Query<ExportQuery>,
) -> HandlerResult {
    if let Err(error_msg) =
        ResourceAccessClaims::validate_token(&url_params.export_token, "historical.png")
    {
        return Err(actix_web::error::ErrorBadRequest(error_msg));
    }

    let result = get_exportable_historical(&pool)
        .await
        .map_err(actix_web::error::ErrorInternalServerError)?;
    let result = serde_json::to_string_pretty(&result)?;

    Ok(HttpResponse::Ok().body(result))
}
