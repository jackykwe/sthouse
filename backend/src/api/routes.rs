use actix_web::{web, Scope};

use crate::api::electricity_readings;
use crate::api::users;

pub fn routes() -> Scope {
    web::scope("/api")
        .service(users::routes())
        .service(electricity_readings::routes())
}
