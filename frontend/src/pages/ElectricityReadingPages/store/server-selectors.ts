import { ElectricityReadingReadGraphDTO } from "services/electricity_readings";
import { OperationType } from "types";
import { createAsyncSelectorUtil } from "utils/sliceUtil";
import {
  CREATE_ELECTRICITY_READING,
  GET_ELECTRICITY_READING_LIST,
  initialState,
  SLICE_NAME,
} from "./server-slice";

export const {
  selectLoading: selectGetElectricityReadingListLoading,
  selectError: selectGetElectricityReadingListError,
  selectData: selectGetElectricityReadingListData,
} = createAsyncSelectorUtil<ElectricityReadingReadGraphDTO[]>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_ELECTRICITY_READING_LIST,
  initialState
);

export const {
  selectLoading: selectCreateElectricityReadingLoading,
  selectError: selectCreateElectricityReadingError,
  selectData: selectCreateElectricityReadingData,
} = createAsyncSelectorUtil<number>()(
  SLICE_NAME,
  OperationType.Mutations,
  CREATE_ELECTRICITY_READING,
  initialState
);
