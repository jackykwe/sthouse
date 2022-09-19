use serde::Serialize;

use crate::api::export::all::{ElectricityReadingModificationExportDTO, UserExportDTO};

#[derive(Serialize)]
pub struct ExportTokenHistoricalDTO {
    pub export_token: String,
    pub image_ids: Vec<i64>,
    pub tombstone_image_ids: Vec<i64>,
}

#[derive(Serialize)]
pub struct ElectricityReadingHistoricalExportDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
    pub creator_id: i64,
    pub tombstone: i64,
}

#[derive(Serialize)]
pub struct ExportReadHistoricalDTO {
    pub unix_ts_millis: i64,
    pub users: Vec<UserExportDTO>,
    pub electricity_readings: Vec<ElectricityReadingHistoricalExportDTO>,
    pub electricity_reading_modifications: Vec<ElectricityReadingModificationExportDTO>,
}
