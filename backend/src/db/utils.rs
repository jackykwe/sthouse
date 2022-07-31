use actix_web::{error as actix_error, web};

use crate::db::types::{Connection, Pool, RSError};
use crate::types::AWError;

pub async fn get_connection(pool: &Pool) -> Result<Connection, AWError> {
    // debug!("get_connection() called");
    let pool = pool.clone();
    web::block(move || pool.get())
        .await?
        .map_err(actix_error::ErrorInternalServerError)
}

pub async fn execute_statement_in_pool<F, R>(closure: F) -> Result<R, AWError>
where
    F: FnOnce() -> Result<R, RSError> + Send + 'static,
    R: Send + 'static,
{
    web::block(closure)
        .await?
        .map_err(actix_error::ErrorInternalServerError)
}
