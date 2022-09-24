use serde::Serialize;

use crate::api::v1::export::all::{ElectricityReadingModificationExportReadDTO, UserExportReadDTO};

#[derive(Serialize)]
pub struct ImageIdAndModificationCount {
    pub image_id: i64,
    pub modification_count: i64,
}
#[derive(Serialize)]
pub struct HistoricalExportRequestReadDTO {
    pub export_token: String,
    pub image_ids_and_modification_counts: Vec<ImageIdAndModificationCount>,
    pub tombstone_image_ids_and_modification_counts: Vec<ImageIdAndModificationCount>,
}

#[derive(Serialize)]
pub struct HistoricalElectricityReadingExportReadDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
    pub creator_id: i64,
    pub tombstone: i64,
}

#[derive(Serialize)]
pub struct HistoricalExportReadDTO {
    pub unix_ts_millis: i64,
    pub users: Vec<UserExportReadDTO>,
    pub electricity_readings: Vec<HistoricalElectricityReadingExportReadDTO>,
    pub electricity_reading_modifications: Vec<ElectricityReadingModificationExportReadDTO>,
}
