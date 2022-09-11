#[allow(dead_code)]
pub struct ElectricityReadingModificationDAO {
    pub reading_id: i64,     // compound primary key (implied unique)
    pub modifier_id: i64,    // compound primary key (implied unique)
    pub unix_ts_millis: i64, // compound primary key (implied unique)
}
