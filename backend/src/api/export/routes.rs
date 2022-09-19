use actix_web::{web, Scope};

use crate::api::export::all;
use crate::api::export::historical;

pub fn routes() -> Scope {
    web::scope("/export")
        .service(historical::routes()) // order matters
        .service(all::routes()) // order matters
}
