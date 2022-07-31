mod api;
mod app_env_config;
mod db;
mod types;

use actix_web::{web, App, HttpResponse, HttpServer};
use dotenv::dotenv;
use log::{info, warn};
use r2d2_sqlite::SqliteConnectionManager;
use std::io::{Error as IOError, ErrorKind};

use crate::app_env_config::AppEnvConfig as AEC;
use crate::db::types::Pool;

const DATABASE_NAME_PROD: &str = "utilities.db";
const DATABASE_NAME_DEV: &str = "utilities-dev.db";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let aec = AEC::default();

    env_logger::init(); // must come after dotenv().ok().
    if aec.dev_mode {
        warn!("You are in DEV_MODE. Do NOT use this in production: certain features are for development only.")
    }

    // Connect to SQLite DB and initialise it if not already done
    let manager = SqliteConnectionManager::file(if aec.dev_mode {
        DATABASE_NAME_DEV
    } else {
        DATABASE_NAME_PROD
    });
    let pool = Pool::new(manager).unwrap();
    db::init::initialise_database(&pool)
        .await
        .map_err(|err| IOError::new(ErrorKind::Other, err.to_string()))
        .expect("Failed to initialise database");

    info!("Starting HTTP server at {}:{}", aec.host, aec.port);
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone())) // store db pool as Data object
            .service(api::api_routes())
            .default_service(web::to(HttpResponse::NotFound))
    })
    .bind((aec.host, aec.port))?
    .run()
    .await
}
