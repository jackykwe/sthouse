use actix_web::{web, Scope};
use log::error;

use super::handlers::{handler_create_electricity_reading, handler_get_electricity_readings};

pub fn routes() -> Scope {
    web::scope("/electricity_readings")
        .app_data(web::JsonConfig::default().error_handler(|err, _req| {
            error!("{}", err);
            actix_web::error::ErrorBadRequest("")
        }))
        .service(handler_get_electricity_readings)
        .service(handler_create_electricity_reading)
}
