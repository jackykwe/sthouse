export interface ElectricityReadingClientState {
  graphStartMillisActInc: number | null;
  graphEndMillisActInc: number;
  graphAbsorbCount: number;
  graphShowBestFit: boolean;
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;
