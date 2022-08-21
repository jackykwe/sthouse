use chrono::Utc;
use log::debug;
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::{
    ElectricityReadingCreateDTO, ElectricityReadingReadGraphDTO,
};
use crate::types::CEResult;

pub async fn get_all_electricity_readings(
    pool: &Pool<Sqlite>,
) -> CEResult<Vec<ElectricityReadingReadGraphDTO>> {
    debug!("get_all_electricity_readings() called");

    Ok(sqlx::query!(
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis \
        FROM electricity_readings \
        ORDER BY unix_ts_millis ASC;\
        ",
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ElectricityReadingReadGraphDTO {
        id: record.id,
        low_kwh: record.low_kwh,
        normal_kwh: record.normal_kwh,
        unix_ts_millis: record.unix_ts_millis,
    })
    .collect::<Vec<_>>())
}

pub async fn get_electricity_readings_between(
    pool: &Pool<Sqlite>,
    start_unix_ts_millis_inc: i64,
    end_unix_ts_millis_inc: i64,
) -> CEResult<Vec<ElectricityReadingReadGraphDTO>> {
    debug!("get_all_electricity_readings() called");

    Ok(sqlx::query!(
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis \
        FROM electricity_readings \
        WHERE unix_ts_millis >= ? AND unix_ts_millis <= ? \
        ORDER BY unix_ts_millis ASC;\
        ",
        start_unix_ts_millis_inc,
        end_unix_ts_millis_inc
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ElectricityReadingReadGraphDTO {
        id: record.id,
        low_kwh: record.low_kwh,
        normal_kwh: record.normal_kwh,
        unix_ts_millis: record.unix_ts_millis,
    })
    .collect::<Vec<_>>())
}

pub async fn create_electricity_reading(
    pool: &Pool<Sqlite>,
    dto: ElectricityReadingCreateDTO,
) -> CEResult<ElectricityReadingReadGraphDTO> {
    debug!("create_electricity_reading() called");

    let unix_ts_millis = Utc::now().timestamp_millis();
    let mut transaction = pool.begin().await?;

    let creator_id = sqlx::query!(
        "\
        INSERT OR IGNORE INTO users (display_name, email) VALUES (?, ?); \
        SELECT id FROM users WHERE display_name = ? AND email = ?;\
        ",
        dto.creator_name,
        dto.creator_email,
        dto.creator_name,
        dto.creator_email
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    let electricity_reading_id = sqlx::query!(
        "\
        INSERT INTO electricity_readings (low_kwh, normal_kwh, unix_ts_millis, creator_id) \
        VALUES (?, ?, ?, ?);\
        ",
        dto.low_kwh,
        dto.normal_kwh,
        unix_ts_millis,
        creator_id,
    )
    .execute(&mut transaction)
    .await?
    .last_insert_rowid();

    transaction.commit().await?;

    Ok(ElectricityReadingReadGraphDTO {
        id: electricity_reading_id,
        low_kwh: dto.low_kwh,
        normal_kwh: dto.normal_kwh,
        unix_ts_millis,
    })
}

pub async fn create_electricity_reading_raw(
    pool: &Pool<Sqlite>,
    low_kwh: f64,
    normal_kwh: f64,
    unix_ts_millis: i64,
    creator_name: &str,
    creator_email: &str,
) -> CEResult<()> {
    debug!("create_electricity_reading() called");

    let mut transaction = pool.begin().await?;

    let creator_id = sqlx::query!(
        "\
        INSERT OR IGNORE INTO users (display_name, email) VALUES (?, ?); \
        SELECT id FROM users WHERE display_name = ? AND email = ?;\
        ",
        creator_name,
        creator_email,
        creator_name,
        creator_email
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    sqlx::query!(
        "\
        INSERT INTO electricity_readings (low_kwh, normal_kwh, unix_ts_millis, creator_id) \
        VALUES (?, ?, ?, ?);\
        ",
        low_kwh,
        normal_kwh,
        unix_ts_millis,
        creator_id,
    )
    .execute(&mut transaction)
    .await?;

    transaction.commit().await?;

    Ok(())
}
