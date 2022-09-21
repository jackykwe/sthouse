use actix_web::{web, Scope};

use super::v1;

pub fn routes() -> Scope {
    web::scope("/api").service(v1::routes::routes())
}
