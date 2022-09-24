use crate::api::v1::export::historical::ImageIdAndModificationCount;

pub struct ExportRequestDAO {
    pub image_ids: Vec<i64>,
}

pub struct HistoricalExportRequestDAO {
    pub image_ids_and_modification_counts: Vec<ImageIdAndModificationCount>,
    pub tombstone_image_ids_and_modification_counts: Vec<ImageIdAndModificationCount>,
}
