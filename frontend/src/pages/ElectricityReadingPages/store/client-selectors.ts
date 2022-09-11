import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "types";
import { initialState } from "./client-slice";

const selectElectricityReadingClient = (state: RootState) =>
  state.electricityReadingClient ?? initialState; // cos injection

export const selectGraphStartMillisActInc = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphStartMillisActInc
);

export const selectGraphEndMillisActInc = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphEndMillisActInc
);

export const selectGraphAbsorbCount = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphAbsorbCount
);

export const selectGraphShowBestFit = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphShowBestFit
);
