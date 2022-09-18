export interface ElectricityReadingClientState {
  graphStartMillisActInc: number | null;
  graphEndMillisActInc: number;
  graphAbsorbCount: number;
  graphShowBestFit: boolean;
  noSelector_isOnCreatePage: boolean;
  noSelector_isOnDetailEditPage: boolean;
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;
