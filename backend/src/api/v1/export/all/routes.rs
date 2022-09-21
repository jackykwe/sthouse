use crate::api::v1::resource_access_token::ResourceAccessClaims;
use actix_files::Files;
use actix_web::{
    dev::{Payload, Service},
    http::header::{self, ContentDisposition, DispositionType, TryIntoHeaderValue},
    web, FromRequest, Scope,
};
use serde::Deserialize;

use super::handlers::{handler_get_export_request, handler_get_exportable_json};

#[derive(Deserialize)]
struct ImageQuery {
    image_token: String,
}

pub fn routes() -> Scope {
    web::scope("")
        .service(handler_get_export_request)
        .service(handler_get_exportable_json)
        // serve_from is relative to root of crate, i.e. the "backend" folder
        .service(
            web::scope("/images/original")
                .service(Files::new("", "./images/original").path_filter(
                    // prevents accessing sub-directory.
                    // path.components().count() is for everything after mount_path (first arg)
                    |path, _| {
                        path.components().count() == 1
                            && path.extension().map(|ext| ext.eq("png")).is_some()
                            && !path.ends_with("_tombstone.png")
                    },
                ))
                .wrap_fn(|req, srv| {
                    // Pointed to by https://stackoverflow.com/q/73455239/7254995
                    // Reference here https://docs.rs/actix-web/latest/actix_web/struct.App.html#method.wrap_fn
                    let fut = srv.call(req);
                    async {
                        let mut response = fut.await?;

                        // Validate timestamp
                        let url_params = web::Query::<ImageQuery>::from_request(
                            response.request(),
                            &mut Payload::None,
                        )
                        .await?;
                        if let Err(error_msg) =
                            ResourceAccessClaims::validate_token(&url_params.image_token, "all.png")
                        {
                            return Err(actix_web::error::ErrorBadRequest(error_msg));
                        }

                        response.headers_mut().insert(
                            header::CONTENT_DISPOSITION,
                            ContentDisposition {
                                disposition: DispositionType::Attachment,
                                parameters: vec![],
                            }
                            .try_into_value()?,
                        );
                        Ok(response)
                    }
                }),
        )
}
