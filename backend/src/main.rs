mod api;
mod app_env_config;
mod auth_config;
mod db;
mod extractors;
mod https_config;
mod middlewares;
mod types;

use std::path::Path;
use std::str::FromStr;

use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use color_eyre::{Report as CEReport, Result as CEResult}; // pub use eyre as well, so eyre is accessible
use dotenvy::dotenv;
use eyre::Context;
use log::{info, LevelFilter};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::ConnectOptions;

use crate::app_env_config::AppEnvConfig as AEC;
use crate::auth_config::Auth0EnvConfig as A0EC;
use crate::https_config::load_rustls_config;

#[actix_web::main]
async fn main() -> CEResult<()> {
    dotenv().ok();
    env_logger::init(); // must come after dotenv().ok().
    color_eyre::install()?;

    let aec = AEC::read_from_dot_env();
    let a0ec = A0EC::read_from_dot_env();

    let https_config = load_rustls_config();

    let ensure_exists = vec!["./images/original", "./images/compressed"];
    for dir_path in ensure_exists {
        if !Path::new(dir_path).exists() {
            info!("Creating directory {}", dir_path);
            std::fs::create_dir_all(dir_path)?;
        }
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(4)
        .connect_with(
            SqliteConnectOptions::from_str(&aec.database_url)?
                .create_if_missing(true)
                // Set sqlx SQL statement execution logging to DEBUG (otherwise INFO is very noisy
                .log_statements(LevelFilter::Debug)
                .clone(), // minor efficiency sacrifice, because log_statements returns &mut Self...
        )
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
    .bind_rustls((aec.host, aec.port), https_config)?
    // .bind((aec.host, aec.port))?
    .run()
    .await
    .map_err(CEReport::from) // All errors in the middle of code (with ?) don't need to be mapped,
                             // but the return type one needs to be mapped, because we aren't using
                             // the ? and so auto-coercing isn't done
}
