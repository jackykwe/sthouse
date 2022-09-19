import { endOfMonthMillisAsOfNowInTzUtil } from "utils/dateUtils";
import { createSliceUtil } from "utils/toolkit";
import { ElectricityReadingClientState } from "./types";

export const SLICE_NAME = "electricityReadingClient";

export const initialState: ElectricityReadingClientState = {
  graphStartMillisActInc: null, // Act for actual (compared to Sys for system)
  graphEndMillisActInc: endOfMonthMillisAsOfNowInTzUtil(),
  graphAbsorbCount: 2,
  graphShowInterpolation: true,
  noSelector_isOnCreatePage: false,
  noSelector_isOnDetailEditPage: false,
};

const clientSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {
    setGraphStartMillisActInc: (
      state,
      action: { payload: number; type: string }
    ) => {
      state.graphStartMillisActInc = action.payload;
    },
    setGraphEndMillisActInc: (
      state,
      action: { payload: number; type: string }
    ) => {
      state.graphEndMillisActInc = action.payload;
    },
    setGraphAbsorbCount: (state, action: { payload: number; type: string }) => {
      state.graphAbsorbCount = action.payload;
    },
    setGraphShowInterpolation: (
      state,
      action: { payload: boolean; type: string }
    ) => {
      state.graphShowInterpolation = action.payload;
    },
    setIsOnCreatePage: (state, action: { payload: boolean; type: string }) => {
      state.noSelector_isOnCreatePage = action.payload;
    },
    setIsOnDetailEditPage: (
      state,
      action: { payload: boolean; type: string }
    ) => {
      state.noSelector_isOnDetailEditPage = action.payload;
    },
  },
});

export const {
  actions: electricityReadingClientActions,
  reducer: electricityReadingClientReducer,
  name: electricityReadingClientName,
} = clientSlice;
