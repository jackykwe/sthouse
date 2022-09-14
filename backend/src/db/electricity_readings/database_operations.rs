use chrono::Utc;
use sqlx::{Pool, Sqlite};

use crate::api::electricity_readings::{
    ElectricityReadingReadFullDTO, ElectricityReadingReadGraphDTO,
};
use crate::types::CEResult;

pub async fn create_electricity_reading(
    pool: &Pool<Sqlite>,
    low_kwh: f64,
    normal_kwh: f64,
    creator_auth0_id: String,
    creator_name: String,
    creator_email: String,
) -> CEResult<i64> {
    let unix_ts_millis = Utc::now().timestamp_millis();
    let mut transaction = pool.begin().await?;

    let creator_id = sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?; \
        SELECT id FROM users \
        WHERE auth0_id = ?;\
        ",
        creator_auth0_id,
        creator_name,
        creator_email,
        creator_name,
        creator_email,
        creator_auth0_id,
        creator_auth0_id,
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    let electricity_reading_id = sqlx::query!(
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
    .await?
    .last_insert_rowid();

    transaction.commit().await?;

    Ok(electricity_reading_id)
}

/**
 * For use during debug/dev init only
 */
pub async fn create_electricity_reading_raw_init(
    pool: &Pool<Sqlite>,
    low_kwh: f64,
    normal_kwh: f64,
    unix_ts_millis: i64,
    creator_auth0_id: String,
    creator_name: String,
    creator_email: String,
) -> CEResult<()> {
    let mut transaction = pool.begin().await?;

    let creator_id = sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?; \
        SELECT id FROM users \
        WHERE auth0_id = ?;\
        ",
        creator_auth0_id,
        creator_name,
        creator_email,
        creator_name,
        creator_email,
        creator_auth0_id,
        creator_auth0_id,
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    sqlx::query!(
        "\
        INSERT OR IGNORE INTO electricity_readings (low_kwh, normal_kwh, unix_ts_millis, creator_id) \
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

pub async fn get_all_electricity_readings(
    pool: &Pool<Sqlite>,
    reader_auth0_id: String,
    reader_name: String,
    reader_email: String,
) -> CEResult<Vec<ElectricityReadingReadGraphDTO>> {
    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?;\
        ",
        reader_auth0_id,
        reader_name,
        reader_email,
        reader_name,
        reader_email,
        reader_auth0_id
    )
    .execute(&mut transaction)
    .await?;

    let result = sqlx::query!(
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis \
        FROM electricity_readings \
        WHERE tombstone = 0 \
        ORDER BY unix_ts_millis ASC;\
        ",
    )
    .fetch_all(&mut transaction)
    .await?
    .into_iter()
    .map(|record| ElectricityReadingReadGraphDTO {
        id: record.id,
        low_kwh: record.low_kwh,
        normal_kwh: record.normal_kwh,
        unix_ts_millis: record.unix_ts_millis,
    })
    .collect::<Vec<_>>();

    transaction.commit().await?;

    Ok(result)
}

pub async fn get_electricity_readings_between(
    pool: &Pool<Sqlite>,
    start_unix_ts_millis_inc: i64,
    end_unix_ts_millis_inc: i64,
    reader_auth0_id: String,
    reader_name: String,
    reader_email: String,
) -> CEResult<Vec<ElectricityReadingReadGraphDTO>> {
    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?;\
        ",
        reader_auth0_id,
        reader_name,
        reader_email,
        reader_name,
        reader_email,
        reader_auth0_id
    )
    .execute(&mut transaction)
    .await?;

    let result = sqlx::query!(
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis \
        FROM electricity_readings \
        WHERE tombstone = 0 AND unix_ts_millis >= ? AND unix_ts_millis <= ? \
        ORDER BY unix_ts_millis ASC;\
        ",
        start_unix_ts_millis_inc,
        end_unix_ts_millis_inc
    )
    .fetch_all(&mut transaction)
    .await?
    .into_iter()
    .map(|record| ElectricityReadingReadGraphDTO {
        id: record.id,
        low_kwh: record.low_kwh,
        normal_kwh: record.normal_kwh,
        unix_ts_millis: record.unix_ts_millis,
    })
    .collect::<Vec<_>>();

    transaction.commit().await?;

    Ok(result)
}

pub async fn get_electricity_reading(
    pool: &Pool<Sqlite>,
    id: i64,
    reader_auth0_id: String,
    reader_name: String,
    reader_email: String,
) -> CEResult<Option<ElectricityReadingReadFullDTO>> {
    let mut transaction = pool.begin().await?;

    sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?;\
        ",
        reader_auth0_id,
        reader_name,
        reader_email,
        reader_name,
        reader_email,
        reader_auth0_id
    )
    .execute(&mut transaction)
    .await?;

    let reading = sqlx::query!(
        "\
        SELECT e.id, e.low_kwh, e.normal_kwh, e.unix_ts_millis, u.display_name \
        FROM electricity_readings AS e INNER JOIN users AS u \
        ON e.creator_id = u.id \
        WHERE e.tombstone = 0 AND e.id = ?;\
        ",
        id
    )
    .fetch_optional(&mut transaction)
    .await?;

    if reading.is_none() {
        transaction.commit().await?;
        return Ok(None);
    }
    // never fails
    #[allow(clippy::unwrap_used)]
    let reading = reading.unwrap();

    let latest_modification = sqlx::query!(
        "\
        SELECT m.unix_ts_millis, u.display_name \
        FROM electricity_readings AS e \
        INNER JOIN electricity_reading_modifications AS m ON e.id = m.reading_id \
        INNER JOIN users AS u ON m.modifier_id = u.id \
        WHERE e.tombstone = 0 AND e.id = ? \
        ORDER BY m.unix_ts_millis DESC \
        LIMIT 1;\
        ",
        id
    )
    .fetch_optional(pool)
    .await?;

    transaction.commit().await?;

    #[allow(clippy::unwrap_used)]
    Ok(Some(match latest_modification {
        Some(record) => ElectricityReadingReadFullDTO {
            id: reading.id,
            low_kwh: reading.low_kwh,
            normal_kwh: reading.normal_kwh,
            creation_unix_ts_millis: reading.unix_ts_millis,
            creator_name: reading.display_name,
            latest_modification_unix_ts_millis: record.unix_ts_millis.unwrap(), // never fails (?)
            latest_modifier_name: record.display_name.unwrap(),                 // never fails (?)
        },
        None => ElectricityReadingReadFullDTO {
            id: reading.id,
            low_kwh: reading.low_kwh,
            normal_kwh: reading.normal_kwh,
            creation_unix_ts_millis: reading.unix_ts_millis,
            creator_name: reading.display_name.clone(),
            latest_modification_unix_ts_millis: reading.unix_ts_millis,
            latest_modifier_name: reading.display_name,
        },
    }))
}

pub async fn update_electricity_reading(
    pool: &Pool<Sqlite>,
    reading_id: i64,
    new_low_kwh: f64,
    new_normal_kwh: f64,
    modifier_auth0_id: String,
    modifier_name: String,
    modifier_email: String,
) -> CEResult<()> {
    let unix_ts_millis = Utc::now().timestamp_millis();
    let mut transaction = pool.begin().await?;

    let modifier_id = sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?; \
        SELECT id FROM users \
        WHERE auth0_id = ?;\
        ",
        modifier_auth0_id,
        modifier_name,
        modifier_email,
        modifier_name,
        modifier_email,
        modifier_auth0_id,
        modifier_auth0_id,
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    sqlx::query!(
        "\
        UPDATE electricity_readings
        SET (low_kwh, normal_kwh) = (?, ?) \
        WHERE tombstone = 0 AND id = ?;\
        ",
        new_low_kwh,
        new_normal_kwh,
        reading_id
    )
    .execute(&mut transaction)
    .await?;

    sqlx::query!(
        "\
        INSERT INTO electricity_reading_modifications (reading_id, modifier_id, unix_ts_millis) \
        VALUES (?, ?, ?);\
        ",
        reading_id,
        modifier_id,
        unix_ts_millis
    )
    .execute(&mut transaction)
    .await?;

    transaction.commit().await?;

    Ok(())
}

pub async fn delete_electricity_reading(
    pool: &Pool<Sqlite>,
    reading_id: i64,
    modifier_auth0_id: String,
    modifier_name: String,
    modifier_email: String,
) -> CEResult<()> {
    let unix_ts_millis = Utc::now().timestamp_millis();
    let mut transaction = pool.begin().await?;

    let modifier_id = sqlx::query!(
        "\
        INSERT INTO users (auth0_id, display_name, email) \
        VALUES (?, ?, ?) \
        ON CONFLICT (auth0_id) DO \
        UPDATE SET (display_name, email) = (?, ?) \
        WHERE auth0_id = ?; \
        SELECT id FROM users \
        WHERE auth0_id = ?;\
        ",
        modifier_auth0_id,
        modifier_name,
        modifier_email,
        modifier_name,
        modifier_email,
        modifier_auth0_id,
        modifier_auth0_id,
    )
    .fetch_one(&mut transaction)
    .await?
    .id;

    sqlx::query!(
        "\
        UPDATE electricity_readings
        SET tombstone = 1 \
        WHERE id = ?;\
        ",
        reading_id
    )
    .execute(&mut transaction)
    .await?;

    sqlx::query!(
        "\
        INSERT INTO electricity_reading_modifications (reading_id, modifier_id, unix_ts_millis) \
        VALUES (?, ?, ?);\
        ",
        reading_id,
        modifier_id,
        unix_ts_millis
    )
    .execute(&mut transaction)
    .await?;

    transaction.commit().await?;

    Ok(())
}
