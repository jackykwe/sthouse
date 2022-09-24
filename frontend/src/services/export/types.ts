export interface ExportRequestReadDTO {
  export_token: string;
  image_ids: number[];
}

export interface ImageIdAndModificationCount {
  image_id: number;
  modification_count: number;
}

export interface HistoricalExportRequestReadDTO {
  export_token: String;
  image_ids_and_modification_counts: ImageIdAndModificationCount[];
  tombstone_image_ids_and_modification_counts: ImageIdAndModificationCount[];
}
