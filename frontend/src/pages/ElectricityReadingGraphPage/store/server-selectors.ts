import { ElectricityReadingReadDTO } from "services/electricity_readings";
import { OperationType } from "types";
import { createAsyncSelectorUtil } from "utils/sliceUtil";
import {
  GET_ELECTRICITY_READING_LIST,
  initialState,
  SLICE_NAME,
} from "./server-slice";

export const {
  selectLoading: selectGetElectricityReadingListLoading,
  selectError: selectGetElectricityReadingListError,
  selectData: selectGetElectricityReadingListData,
} = createAsyncSelectorUtil<ElectricityReadingReadDTO[]>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_ELECTRICITY_READING_LIST,
  initialState
);
