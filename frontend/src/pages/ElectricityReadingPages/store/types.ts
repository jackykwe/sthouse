export interface ElectricityReadingClientState {
  graphStartUnixTsMillisActInc: number | null;
  graphEndUnixTsMillisActInc: number;
  graphAbsorbCount: number;
  graphShowBestFit: boolean;
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;
