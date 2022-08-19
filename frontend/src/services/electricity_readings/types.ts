export interface ElectricityReadingCreateDTO {
    low_kwh: number,
    normal_kwh: number,
    creator_name: string,
    creator_email: string,
}

export interface ElectricityReadingReadDTO {
    id: number,
    low_kwh: number,
    normal_kwh: number,
    unix_ts_millis: number,
    creator_name: string,
}
