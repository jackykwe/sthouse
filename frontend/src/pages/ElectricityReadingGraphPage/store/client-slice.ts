import {
  DEFAULT_TARGET_TIME_ZONE,
  endOfMonthMillisAsOfNowInTzUtil,
} from "utils/dateUtils";
import { createSliceUtil } from "utils/toolkit";
import { ElectricityReadingClientState } from "./types";

export const SLICE_NAME = "electricityReadingClient";

export const initialState: ElectricityReadingClientState = {
  graphStartUnixTsMillisActInc: null, // Act for actual (compared to Sys for system)
  graphEndUnixTsMillisActInc: endOfMonthMillisAsOfNowInTzUtil(
    DEFAULT_TARGET_TIME_ZONE
  ),
  graphAbsorbCount: 2,
  graphShowBestFit: true,
};

const clientSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setGraphStartUnixTsMillisActInc: (
      state,
      action: { payload: number; type: string }
    ) => {
      state.graphStartUnixTsMillisActInc = action.payload;
    },
    setGraphEndUnixTsMillisActInc: (
      state,
      action: { payload: number; type: string }
    ) => {
      state.graphEndUnixTsMillisActInc = action.payload;
    },
    setGraphAbsorbCount: (state, action: { payload: number; type: string }) => {
      state.graphAbsorbCount = action.payload;
    },
    setGraphShowBestFit: (
      state,
      action: { payload: boolean; type: string }
    ) => {
      state.graphShowBestFit = action.payload;
    },
    resetGraphStartEndUnixTsMillisActInc: (state) => {
      state.graphStartUnixTsMillisActInc =
        initialState.graphStartUnixTsMillisActInc;
      state.graphEndUnixTsMillisActInc =
        initialState.graphEndUnixTsMillisActInc;
    },
  },
});

export const {
  actions: electricityReadingClientActions,
  reducer: electricityReadingClientReducer,
  name: electricityReadingClientName,
} = clientSlice;
