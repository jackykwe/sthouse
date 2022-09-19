use std::path::Path;

use actix_easy_multipart::extractor::MultipartFormConfig;
use actix_files::Files;
use actix_web::{
    dev::{Payload, Service},
    web, FromRequest, Scope,
};
use serde::Deserialize;

use crate::api::image_token::ImageClaims;

use super::handlers::{
    handler_create_electricity_reading, handler_delete_electricity_reading,
    handler_get_electricity_reading, handler_get_electricity_readings,
    handler_get_latest_electricity_reading_millis, handler_update_electricity_reading,
};

#[derive(Deserialize)]
struct ImageQuery {
    image_token: String,
}

pub fn routes() -> Scope {
    web::scope("/electricity_readings")
        .app_data(
            MultipartFormConfig::default()
                .file_limit(20 * 1024 * 1024)
                .max_parts(5),
        )
        .service(handler_get_electricity_readings)
        .service(handler_get_latest_electricity_reading_millis) // order matters
        .service(handler_get_electricity_reading) // order matters
        .service(handler_create_electricity_reading)
        .service(handler_update_electricity_reading)
        .service(handler_delete_electricity_reading)
        // serve_from is relative to root of crate, i.e. the "backend" folder
        .service(
            web::scope("/images/compressed")
                .service(Files::new("", "./images/compressed").path_filter(
                    // prevents accessing sub-directory.
                    // path.components().count() is for everything after mount_path (first arg)
                    |path, _| {
                        path.components().count() == 1
                            && path.extension().map(|ext| ext.eq("jpg")).is_some()
                    },
                ))
                .wrap_fn(|req, srv| {
                    // Pointed to by https://stackoverflow.com/q/73455239/7254995
                    // Reference here https://docs.rs/actix-web/latest/actix_web/struct.App.html#method.wrap_fn
                    let intended_audience = Path::new(req.path()).file_name().map(|path| {
                        path.to_owned()
                            .into_string()
                            .unwrap_or_else(|_err_osstring| String::from(""))
                    });
                    let fut = srv.call(req);
                    async {
                        match intended_audience {
                            // intended audience can't be verified, won't happen for actual resources
                            None => Err(actix_web::error::ErrorNotFound("")),
                            Some(aud) => {
                                let response = fut.await?;

                                // Validate timestamp
                                let url_params = web::Query::<ImageQuery>::from_request(
                                    response.request(),
                                    &mut Payload::None,
                                )
                                .await?;
                                match ImageClaims::validate_token(&url_params.image_token, &aud) {
                                    Ok(_) => Ok(response),
                                    Err(error_msg) => {
                                        Err(actix_web::error::ErrorBadRequest(error_msg))
                                    }
                                }
                            }
                        }
                    }
                }),
        )
}
