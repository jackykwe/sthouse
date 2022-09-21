use actix_web::{web, Scope};

use crate::api::v1::export::all;
use crate::api::v1::export::historical;

pub fn routes() -> Scope {
    web::scope("/export")
        .service(historical::routes()) // order matters
        .service(all::routes()) // order matters
}
