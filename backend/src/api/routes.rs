use actix_web::{web, Scope};

use super::electricity_readings;
use super::users;

pub fn api_routes() -> Scope {
    web::scope("/api")
        .service(users::routes())
        .service(electricity_readings::routes())
}
