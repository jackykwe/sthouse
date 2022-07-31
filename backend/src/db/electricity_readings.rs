use chrono::Utc;
use log::debug;
use rusqlite::params;

use crate::api::electricity_readings::{ElectricityReadingCreateDTO, ElectricityReadingReadDTO};
use crate::db::types::Pool;
use crate::db::utils::{execute_statement_in_pool, get_connection};
use crate::types::AWError;

pub async fn get_all_electricity_readings(
    pool: &Pool,
) -> Result<Vec<ElectricityReadingReadDTO>, AWError> {
    debug!("get_all_electricity_readings() called");

    let conn = get_connection(pool).await?;
    execute_statement_in_pool(move || {
        conn.prepare(
            "
            SELECT e.id, e.low_kwh, e.normal_kwh, e.unix_ts_millis, u.display_name
            FROM electricity_readings AS e INNER JOIN users AS u
            ON e.creator_id = u.id
            ORDER BY e.unix_ts_millis ASC;
            ",
        )?
        .query_map([], |row| {
            Ok(ElectricityReadingReadDTO {
                id: row.get(0)?,
                low_kwh: row.get(1)?,
                normal_kwh: row.get(2)?,
                unix_ts_millis: row.get(3)?,
                creator_name: row.get(4)?,
            })
        })
        .and_then(Iterator::collect)
    })
    .await
}

pub async fn create_electricity_reading(
    pool: &Pool,
    dto: ElectricityReadingCreateDTO,
) -> Result<ElectricityReadingReadDTO, AWError> {
    debug!("create_electricity_reading() called");
    let unix_ts_millis = Utc::now().timestamp_millis();

    let mut conn = get_connection(pool).await?;
    execute_statement_in_pool(move || {
        let tx = conn.transaction()?;
        tx.execute(
            "
            INSERT OR IGNORE INTO users (display_name, email)
            VALUES (?, ?);
            ",
            params![dto.creator_name, dto.creator_email],
        )?;
        let creator_id = tx
            .query_row(
                "
            SELECT id FROM users
            WHERE display_name = ? AND email = ?;
            ",
                params![dto.creator_name, dto.creator_email],
                |x| Ok(x.get(0)?),
            )
            .unwrap_or_else(|_err| tx.last_insert_rowid()); // if SELECT returned no rows, means an insert happened (rusqlite peculiarity... within a transaction, query after insert won't detect the insert)
        tx.execute(
            "
            INSERT INTO electricity_readings (low_kwh, normal_kwh, unix_ts_millis, creator_id)
            VALUES
            (?, ?, ?, ?)
            ",
            params![dto.low_kwh, dto.normal_kwh, unix_ts_millis, creator_id],
        )?;
        let electricity_reading_id = tx.last_insert_rowid();
        tx.commit()?;
        Ok(ElectricityReadingReadDTO {
            id: electricity_reading_id,
            low_kwh: dto.low_kwh,
            normal_kwh: dto.normal_kwh,
            unix_ts_millis,
            creator_name: dto.creator_name,
        })
    })
    .await
}
