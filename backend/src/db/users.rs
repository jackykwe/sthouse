use log::debug;

use crate::api::users::UserReadDTO;
use crate::db::types::Pool;
use crate::db::utils::{execute_statement_in_pool, get_connection};
use crate::types::AWError;

pub async fn get_all_users(pool: &Pool) -> Result<Vec<UserReadDTO>, AWError> {
    debug!("get_all_users() called");

    let conn = get_connection(pool).await?;
    execute_statement_in_pool(move || {
        conn.prepare(
            "
            SELECT id, display_name, email FROM users
            ORDER BY id ASC
            ",
        )?
        .query_map([], |row| {
            Ok(UserReadDTO {
                id: row.get(0)?,
                display_name: row.get(1)?,
                email: row.get(2)?,
            })
        })
        .and_then(Iterator::collect)
    })
    .await
}
