import { ElectricityReadingReadGraphDTO } from "services/electricity_readings";
import { AsyncState, OperationType } from "types";

export interface ElectricityReadingClientState {
  graphStartUnixTsMillisActInc: number | null;
  graphEndUnixTsMillisActInc: number;
  graphAbsorbCount: number;
  graphShowBestFit: boolean;
}

export interface ElectricityReadingServerState {
  [OperationType.Queries]: {
    getElectricityReadingList: AsyncState<ElectricityReadingReadGraphDTO[]>;
  };
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;

export type GetElectricityReadingListRequestActionArg = {
  startUnixTsMillisInc?: number;
  endUnixTsMillisInc?: number;
};
