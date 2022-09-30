use actix_web::{web, Scope};

use crate::api::v1::electricity_readings;
use crate::api::v1::export;
use crate::api::v1::static_resources;
use crate::api::v1::users;

pub fn routes() -> Scope {
    web::scope("/v1")
        .service(users::routes())
        .service(electricity_readings::routes())
        .service(export::routes())
        .service(static_resources::routes())
}
