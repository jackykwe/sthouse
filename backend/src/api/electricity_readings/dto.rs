use actix_easy_multipart::{File, FromMultipart};
use serde::{Deserialize, Serialize};

#[derive(FromMultipart)]
pub struct ElectricityReadingCreateMultipartForm {
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub creator_name: String,
    pub creator_email: String,
    pub image: File,
}

#[derive(Serialize, Deserialize)]
pub struct ElectricityReadingReadFullDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
    pub creator_name: String,
}

#[derive(Serialize, Deserialize)]
pub struct ElectricityReadingReadGraphDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
}
