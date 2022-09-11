use actix_easy_multipart::{File, FromMultipart};
use serde::{Deserialize, Serialize};

#[derive(FromMultipart)]
pub struct ElectricityReadingCreateMultipartForm {
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub image: File,
    pub creator_name: String,
    pub creator_email: String,
}

#[derive(Serialize, Deserialize)]
pub struct ElectricityReadingReadFullDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub creation_unix_ts_millis: i64,
    pub creator_name: String,
    pub latest_modification_unix_ts_millis: i64,
    pub latest_modifier_name: String,
}

#[derive(Serialize, Deserialize)]
pub struct ElectricityReadingReadGraphDTO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64,
}

#[derive(FromMultipart)]
pub struct ElectricityReadingUpdateMultipartForm {
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub modifier_name: String,
    pub modifier_email: String,
    pub image: Option<File>,
}
