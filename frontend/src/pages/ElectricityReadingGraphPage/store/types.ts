import {
  ElectricityReadingCreateDTO,
  ElectricityReadingReadGraphDTO,
} from "services/electricity_readings";
import { AsyncState, OperationType } from "types";

export interface ElectricityReadingClientState {
  graphStartUnixTsMillisActInc: number | null;
  graphEndUnixTsMillisActInc: number;
}

export interface ElectricityReadingServerState {
  [OperationType.Queries]: {
    getElectricityReadingList: AsyncState<ElectricityReadingReadGraphDTO[]>;
  };
  [OperationType.Mutations]: {
    createElectricityReading: AsyncState<ElectricityReadingReadGraphDTO[]>;
  };
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;

export type GetElectricityReadingListRequestActionArg = {
  startUnixTsMillisInc?: number;
  endUnixTsMillisInc?: number;
};
export type CreateElectricityReadingRequestActionArg =
  ElectricityReadingCreateDTO;
