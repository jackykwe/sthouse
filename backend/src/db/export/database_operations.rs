use chrono::Utc;
use sqlx::{Pool, Sqlite};

use crate::{
    api::export::{
        all::{
            ElectricityReadingExportReadDTO, ElectricityReadingModificationExportReadDTO,
            ExportReadDTO, UserExportReadDTO,
        },
        historical::{HistoricalElectricityReadingExportReadDTO, HistoricalExportReadDTO},
    },
    types::CEResult,
};

use super::{ExportRequestDAO, HistoricalExportRequestDAO};

pub async fn get_exportable_reading_ids(pool: &Pool<Sqlite>) -> CEResult<ExportRequestDAO> {
    let reading_ids = sqlx::query!(
        "\
        SELECT id \
        FROM electricity_readings \
        WHERE tombstone = 0;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| record.id)
    .collect::<Vec<_>>();

    Ok(ExportRequestDAO {
        image_ids: reading_ids,
    })
}

pub async fn get_exportable(pool: &Pool<Sqlite>) -> CEResult<ExportReadDTO> {
    let unix_ts_millis = Utc::now().timestamp_millis();

    let users = sqlx::query_as!(
        UserExportReadDTO,
        "\
        SELECT id, display_name, email \
        FROM users;\
        "
    )
    .fetch_all(pool)
    .await?;

    let electricity_readings = sqlx::query_as!(
        ElectricityReadingExportReadDTO,
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis, creator_id \
        FROM electricity_readings \
        WHERE tombstone = 0;\
        "
    )
    .fetch_all(pool)
    .await?;

    let electricity_reading_modifications = sqlx::query_as!(
        ElectricityReadingModificationExportReadDTO,
        "\
        SELECT reading_id, modifier_id, unix_ts_millis \
        FROM electricity_reading_modifications;\
        "
    )
    .fetch_all(pool)
    .await?;

    Ok(ExportReadDTO {
        unix_ts_millis,
        users,
        electricity_readings,
        electricity_reading_modifications,
    })
}

pub async fn get_exportable_historical_reading_ids(
    pool: &Pool<Sqlite>,
) -> CEResult<HistoricalExportRequestDAO> {
    let reading_ids = sqlx::query!(
        "\
        SELECT id \
        FROM electricity_readings \
        WHERE tombstone = 0;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| record.id)
    .collect::<Vec<_>>();

    let tombstone_reading_ids = sqlx::query!(
        "\
        SELECT id \
        FROM electricity_readings \
        WHERE tombstone = 1;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| record.id)
    .collect::<Vec<_>>();

    Ok(HistoricalExportRequestDAO {
        image_ids: reading_ids,
        tombstone_image_ids: tombstone_reading_ids,
    })
}

pub async fn get_exportable_historical(pool: &Pool<Sqlite>) -> CEResult<HistoricalExportReadDTO> {
    let unix_ts_millis = Utc::now().timestamp_millis();

    let users = sqlx::query_as!(
        UserExportReadDTO,
        "\
        SELECT id, display_name, email \
        FROM users;\
        "
    )
    .fetch_all(pool)
    .await?;

    let electricity_readings = sqlx::query_as!(
        HistoricalElectricityReadingExportReadDTO,
        "\
        SELECT id, low_kwh, normal_kwh, unix_ts_millis, creator_id, tombstone \
        FROM electricity_readings;\
        "
    )
    .fetch_all(pool)
    .await?;

    let electricity_reading_modifications = sqlx::query_as!(
        ElectricityReadingModificationExportReadDTO,
        "\
        SELECT reading_id, modifier_id, unix_ts_millis \
        FROM electricity_reading_modifications;\
        "
    )
    .fetch_all(pool)
    .await?;

    Ok(HistoricalExportReadDTO {
        unix_ts_millis,
        users,
        electricity_readings,
        electricity_reading_modifications,
    })
}
