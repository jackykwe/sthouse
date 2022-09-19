pub struct ElectricityReadingReadFullDAO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub creation_unix_ts_millis: i64,
    pub creator_name: String,
    pub creator_email: String,
    pub latest_modification_unix_ts_millis: i64,
    pub latest_modifier_name: String,
    pub latest_modifier_email: String,
}
