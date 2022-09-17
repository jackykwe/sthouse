use actix_web::{web, Scope};

use super::handlers::{handler_get_user, handler_update_user};

pub fn routes() -> Scope {
    web::scope("/user")
        .service(handler_get_user)
        .service(handler_update_user)
}
