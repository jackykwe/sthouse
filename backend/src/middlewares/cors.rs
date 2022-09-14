use actix_cors::Cors;
use actix_web::http::{header, Method};

pub fn cors(client_origin_url: &str) -> Cors {
    Cors::default()
        .allowed_origin(client_origin_url)
        .allowed_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allowed_headers(vec![header::AUTHORIZATION])
        // .allowed_headers(vec![header::AUTHORIZATION, header::CONTENT_TYPE])
        .max_age(3600)
}
