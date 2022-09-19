pub struct ExportRequestDAO {
    pub image_ids: Vec<i64>,
}

pub struct HistoricalExportRequestDAO {
    pub image_ids: Vec<i64>,
    pub tombstone_image_ids: Vec<i64>,
}
