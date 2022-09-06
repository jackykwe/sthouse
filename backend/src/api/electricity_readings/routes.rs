use actix_easy_multipart::extractor::MultipartFormConfig;
use actix_files::Files;
use actix_web::{web, Scope};

use super::handlers::{handler_create_electricity_reading, handler_get_electricity_readings};

pub fn routes() -> Scope {
    web::scope("/electricity_readings")
        .app_data(
            MultipartFormConfig::default()
                .file_limit(20 * 1024 * 1024)
                .max_parts(5),
        )
        .service(handler_get_electricity_readings)
        .service(handler_create_electricity_reading)
        // ./images is relative to root of crate, i.e. the "backend" folder
        .service(Files::new("/images", "./images/compressed").path_filter(
            // prevents accessing sub-directory.
            // path.components().count() is for mount_path (first arg)
            |path, _| {
                path.components().count() == 1
                    && path.extension().map(|ext| ext.eq("jpg")).is_some()
            },
        ))
}
