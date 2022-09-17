use sqlx::{Pool, Sqlite};

use crate::api::users::UserReadDTO;
use crate::types::{CEReport, CEResult};

pub async fn create_user(
    pool: &Pool<Sqlite>,
    auth0_id: String,
    display_name: String,
    email: String,
) -> CEResult<UserReadDTO> {
    sqlx::query_as!(
        UserReadDTO,
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?); \
        SELECT display_name, email FROM users \
        WHERE auth0_id = ?;\
        ",
        auth0_id,
        display_name,
        email,
        auth0_id,
    )
    .fetch_one(pool)
    .await
    .map_err(CEReport::from)
}

pub async fn get_user(pool: &Pool<Sqlite>, auth0_id: String) -> CEResult<Option<UserReadDTO>> {
    sqlx::query_as!(
        UserReadDTO,
        "\
        SELECT display_name, email FROM users \
        WHERE auth0_id = ?;\
        ",
        auth0_id,
    )
    .fetch_optional(pool)
    .await
    .map_err(CEReport::from) // All errors in the middle of code (with ?) don't need to be mapped,
                             // but the return type one needs to be mapped, because we aren't using
                             // the ? and so auto-coercing isn't done
}

/// Assumption: User already exists
pub async fn update_user(
    pool: &Pool<Sqlite>,
    auth0_id: String,
    new_display_name: String,
) -> CEResult<UserReadDTO> {
    sqlx::query_as!(
        UserReadDTO,
        "\
        UPDATE users \
        SET display_name = ? \
        WHERE auth0_id = ?; \
        SELECT display_name, email FROM users \
        WHERE auth0_id = ?;\
        ",
        new_display_name,
        auth0_id,
        auth0_id,
    )
    .fetch_one(pool)
    .await
    .map_err(CEReport::from)
}
