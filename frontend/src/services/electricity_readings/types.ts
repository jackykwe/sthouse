export interface ElectricityReadingReadGraphDTO {
  id: number;
  low_kwh: number;
  normal_kwh: number;
  unix_ts_millis: number;
}

export interface ElectricityReadingReadFullDTO {
  id: number;
  low_kwh: number;
  normal_kwh: number;
  creation_unix_ts_millis: number;
  creator_name: string;
  latest_modification_unix_ts_millis: number;
  latest_modifier_name: string;
}
