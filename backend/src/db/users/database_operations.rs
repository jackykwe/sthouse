use log::debug;
use sqlx::{Pool, Sqlite};

use crate::api::users::UserReadDTO;
use crate::types::{CEReport, CEResult};

pub async fn get_all_users(pool: &Pool<Sqlite>) -> CEResult<Vec<UserReadDTO>> {
    debug!("get_all_users() called");
    sqlx::query_as!(
        UserReadDTO,
        "\
        SELECT id, display_name, email FROM users \
        ORDER BY id ASC;\
        "
    )
    .fetch_all(pool)
    .await
    .map_err(CEReport::from) // All errors in the middle of code (with ?) don't need to be mapped,
                             // but the return type one needs to be mapped, because we aren't using
                             // the ? and so auto-coercing isn't done
}
