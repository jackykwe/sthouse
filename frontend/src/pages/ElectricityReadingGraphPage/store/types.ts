import {
  ElectricityReadingCreateDTO,
  ElectricityReadingReadDTO,
} from "services/electricity_readings";
import { AsyncState, OperationType } from "types";

export interface ElectricityReadingServerState {
  [OperationType.Queries]: {
    getElectricityReadingList: AsyncState<ElectricityReadingReadDTO[]>;
  };
  [OperationType.Mutations]: {
    createElectricityReading: AsyncState<ElectricityReadingReadDTO[]>;
  };
}

export type GetElectricityReadingListRequestActionArg = undefined; // TODO: Pagination
export type CreateElectricityReadingRequestActionArg =
  ElectricityReadingCreateDTO;
