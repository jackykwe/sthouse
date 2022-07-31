use actix_web::{error as actix_error, web, Scope};
use log::error;

use super::handlers::{handler_create_electricity_reading, handler_get_all_electricity_readings};

pub fn routes() -> Scope {
    web::scope("/electricity_readings")
        .app_data(web::JsonConfig::default().error_handler(|err, _req| {
            error!("{}", err);
            actix_error::ErrorBadRequest("")
        }))
        .service(handler_get_all_electricity_readings)
        .service(handler_create_electricity_reading)
}
