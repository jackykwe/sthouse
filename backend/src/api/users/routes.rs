use actix_web::{web, Scope};

use crate::api::users::handlers::handler_get_all_users;

pub fn routes() -> Scope {
    web::scope("/users").service(handler_get_all_users)
}
