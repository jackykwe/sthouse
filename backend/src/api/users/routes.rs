use actix_web::{web, Scope};

use crate::api::users::handlers::handler_get_user;

pub fn routes() -> Scope {
    web::scope("/user").service(handler_get_user)
}
