use chrono::Utc;
use log::debug;
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::{ElectricityReadingCreateDTO, ElectricityReadingReadDTO};
use crate::types::CEResult;

pub async fn get_all_electricity_readings(
    pool: &Pool<Sqlite>,
) -> CEResult<Vec<ElectricityReadingReadDTO>> {
    debug!("get_all_electricity_readings() called");

    Ok(sqlx::query!(
        "\
        SELECT e.id, e.low_kwh, e.normal_kwh, e.unix_ts_millis, u.display_name \
        FROM electricity_readings AS e INNER JOIN users AS u \
        ON e.creator_id = u.id \
        ORDER BY e.unix_ts_millis ASC;\
        ",
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ElectricityReadingReadDTO {
        id: record.id,
        low_kwh: record.low_kwh,
        normal_kwh: record.normal_kwh,
        unix_ts_millis: record.unix_ts_millis,
        creator_name: record.display_name,
    })
    .collect::<Vec<_>>())
}

pub async fn create_electricity_reading(
    pool: &Pool<Sqlite>,
    dto: ElectricityReadingCreateDTO,
) -> CEResult<ElectricityReadingReadDTO> {
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

    Ok(ElectricityReadingReadDTO {
        id: electricity_reading_id,
        low_kwh: dto.low_kwh,
        normal_kwh: dto.normal_kwh,
        unix_ts_millis,
        creator_name: dto.creator_name,
    })
}
