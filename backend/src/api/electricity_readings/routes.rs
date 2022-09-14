use std::collections::HashSet;

use actix_easy_multipart::extractor::MultipartFormConfig;
use actix_files::Files;
use actix_web::{
    dev::{Payload, Service},
    web, FromRequest, Scope,
};

use crate::{
    api::FORBIDDEN_ERROR_TEXT,
    extractors::{ElectricityReadingPerms, VerifiedAuthInfo},
};

use super::handlers::{
    handler_create_electricity_reading, handler_delete_electricity_reading,
    handler_get_electricity_reading, handler_get_electricity_readings,
    handler_update_electricity_reading,
};

pub fn routes() -> Scope {
    web::scope("/electricity_readings")
        .app_data(
            MultipartFormConfig::default()
                .file_limit(20 * 1024 * 1024)
                .max_parts(5),
        )
        .service(handler_get_electricity_readings)
        .service(handler_create_electricity_reading)
        .service(handler_get_electricity_reading)
        .service(handler_update_electricity_reading)
        .service(handler_delete_electricity_reading)
        // ./images is relative to root of crate, i.e. the "backend" folder
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
                    let fut = srv.call(req);
                    async {
                        let response = fut.await?;
                        let vai =
                            VerifiedAuthInfo::from_request(response.request(), &mut Payload::None)
                                .await?;
                        if vai.has_permissions(&HashSet::from([
                            ElectricityReadingPerms::Read.to_string()
                        ])) {
                            Ok(response)
                        } else {
                            Err(actix_web::error::ErrorForbidden(FORBIDDEN_ERROR_TEXT))
                        }
                    }
                }),
        )
}
