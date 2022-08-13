use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectricityReadingCreateDTO {
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub creator_name: String,
    pub creator_email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectricityReadingReadDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
    pub creator_name: String,
}
