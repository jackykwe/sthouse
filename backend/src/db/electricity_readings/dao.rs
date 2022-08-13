#[derive(Debug)]
pub struct ElectricityReadingDAO {
    pub id: i64,
    pub low_kwh: f64,
    pub normal_kwh: f64,
    pub unix_ts_millis: i64, // compound unique
    pub creator_id: i64,     // compound unique
}
