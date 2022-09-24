use std::collections::HashMap;

use chrono::Utc;
use sqlx::{Pool, Sqlite};

use crate::{
    api::v1::export::{
        all::{
            ElectricityReadingExportReadDTO, ElectricityReadingModificationExportReadDTO,
            ExportReadDTO, UserExportReadDTO,
        },
        historical::{
            HistoricalElectricityReadingExportReadDTO, HistoricalExportReadDTO,
            ImageIdAndModificationCount,
        },
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
        SELECT reading_id, modifier_id, unix_ts_millis, image_modified \
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
    #[allow(clippy::unwrap_used)]
    let reading_modification_counts = sqlx::query!(
        "\
        SELECT reading_id, count(image_modified) as count \
        FROM electricity_reading_modifications \
        WHERE image_modified = 1 \
        GROUP BY reading_id;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| (record.reading_id, record.count.unwrap())) // unwrap should not fail
    .collect::<HashMap<_, _>>();

    let reading_ids_and_modification_counts = sqlx::query!(
        "\
        SELECT id \
        FROM electricity_readings \
        WHERE tombstone = 0;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ImageIdAndModificationCount {
        image_id: record.id,
        modification_count: match reading_modification_counts.get(&record.id) {
            None => 0,
            Some(&count) => count.into(),
        },
    })
    .collect::<Vec<_>>();

    let tombstone_reading_ids_and_modification_counts = sqlx::query!(
        "\
        SELECT id \
        FROM electricity_readings \
        WHERE tombstone = 1;\
        "
    )
    .fetch_all(pool)
    .await?
    .into_iter()
    .map(|record| ImageIdAndModificationCount {
        image_id: record.id,
        modification_count: match reading_modification_counts.get(&record.id) {
            None => 0,
            Some(&count) => count.into(),
        },
    })
    .collect::<Vec<_>>();

    Ok(HistoricalExportRequestDAO {
        image_ids_and_modification_counts: reading_ids_and_modification_counts,
        tombstone_image_ids_and_modification_counts: tombstone_reading_ids_and_modification_counts,
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
        SELECT reading_id, modifier_id, unix_ts_millis, image_modified \
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
