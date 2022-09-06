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
  [OperationType.Mutations]: {
    createElectricityReading: AsyncState<number>;
  };
}

export type SetGraphStartActionArg = Date;
export type SetGraphEndActionArg = Date;

export type GetElectricityReadingListRequestActionArg = {
  startUnixTsMillisInc?: number;
  endUnixTsMillisInc?: number;
};
export type CreateElectricityReadingRequestActionArg = {
  low_kwh: number;
  normal_kwh: number;
  creator_name: string;
  creator_email: string;
  image: Blob;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
};
