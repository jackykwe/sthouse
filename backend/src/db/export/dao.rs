pub struct ExportTokenDAO {
    pub image_ids: Vec<i64>,
}

pub struct ExportTokenHistoricalDAO {
    pub image_ids: Vec<i64>,
    pub tombstone_image_ids: Vec<i64>,
}
