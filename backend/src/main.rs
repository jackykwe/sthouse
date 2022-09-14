mod api;
mod app_env_config;
mod auth_config;
mod db;
mod extractors;
mod middlewares;
mod types;

use std::str::FromStr;

use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use color_eyre::{Report as CEReport, Result as CEResult}; // pub use eyre as well, so eyre is accessible
use dotenvy::dotenv;
use eyre::Context;
use log::info;
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};

use crate::app_env_config::AppEnvConfig as AEC;
use crate::auth_config::Auth0EnvConfig as A0EC;
// use crate::db::types::Pool;

#[actix_web::main]
async fn main() -> CEResult<()> {
    dotenv().ok();
    env_logger::init(); // must come after dotenv().ok().
    color_eyre::install()?;

    let aec = AEC::read_from_dot_env();
    let a0ec = A0EC::read_from_dot_env();

    let pool = SqlitePoolOptions::new()
        .max_connections(4)
        .connect_with(SqliteConnectOptions::from_str(&aec.database_url)?.create_if_missing(true))
        .await?;

    db::init::initialise_database(&pool)
        .await
        .wrap_err("Failed to initialise database")?;

    info!("Starting HTTP server at {}:{}", aec.host, aec.port);

    HttpServer::new(move || {
        // one of these is run for every thread (default is number of physical CPUs)
        App::new()
            .app_data(a0ec.clone())
            .app_data(web::Data::new(pool.clone())) // store db pool as Data object
            .wrap(middleware::Logger::default())
            .wrap(middlewares::cors(&aec.client_origin_url))
            .service(api::routes::routes())
            .default_service(web::to(HttpResponse::NotFound))
    })
    .bind((aec.host, aec.port))?
    .run()
    .await
    .map_err(CEReport::from)
}
