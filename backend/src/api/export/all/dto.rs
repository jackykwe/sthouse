use serde::Serialize;

#[derive(Serialize)]
pub struct ExportTokenDTO {
    pub export_token: String,
    pub image_ids: Vec<i64>,
}

#[derive(Serialize)]
pub struct UserExportDTO {
    pub id: i64,
    pub display_name: String,
    pub email: String,
}

#[derive(Serialize)]
pub struct ElectricityReadingExportDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
    pub creator_id: i64,
}

#[derive(Serialize)]
pub struct ElectricityReadingModificationExportDTO {
    pub reading_id: i64,
    pub modifier_id: i64,
    pub unix_ts_millis: i64,
}

#[derive(Serialize)]
pub struct ExportReadDTO {
    pub unix_ts_millis: i64,
    pub users: Vec<UserExportDTO>,
    pub electricity_readings: Vec<ElectricityReadingExportDTO>,
    pub electricity_reading_modifications: Vec<ElectricityReadingModificationExportDTO>,
}
