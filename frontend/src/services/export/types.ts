export interface ExportRequestReadDTO {
  export_token: string;
  image_ids: number[];
}

export interface HistoricalExportRequestReadDTO {
  export_token: String;
  image_ids: number[];
  tombstone_image_ids: number[];
}
