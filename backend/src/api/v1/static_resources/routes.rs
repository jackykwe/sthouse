use actix_web::{
    dev::Service,
    http::header::{self, ContentDisposition, DispositionType, TryIntoHeaderValue},
    web, Scope,
};

use super::handlers::{handler_get_how_it_works, handler_get_privacy_policy};

pub fn routes() -> Scope {
    web::scope("/static")
        .service(
            web::scope("/pdf")
                .route("/How-It-Works.pdf", web::get().to(handler_get_how_it_works))
                .wrap_fn(|req, srv| {
                    // Pointed to by https://stackoverflow.com/q/73455239/7254995
                    // Reference here https://docs.rs/actix-web/latest/actix_web/struct.App.html#method.wrap_fn
                    let fut = srv.call(req);
                    async {
                        let mut response = fut.await?;
                        response.headers_mut().insert(
                            header::CONTENT_DISPOSITION,
                            ContentDisposition {
                                disposition: DispositionType::Inline,
                                parameters: vec![],
                            }
                            .try_into_value()?,
                        );
                        Ok(response)
                    }
                }),
        )
        .service(web::scope("/html").route(
            "/privacy-policy.html",
            web::get().to(handler_get_privacy_policy),
        ))
}
