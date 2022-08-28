import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "types";
import { initialState } from "./client-slice";

const selectElectricityReadingClient = (state: RootState) =>
  state.electricityReadingClient ?? initialState; // cos injection

export const selectGraphStartUnixTsMillisActInc = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) =>
    electricityReadingClient.graphStartUnixTsMillisActInc
);

export const selectGraphEndUnixTsMillisActInc = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) =>
    electricityReadingClient.graphEndUnixTsMillisActInc
);

export const selectGraphAbsorbCount = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphAbsorbCount
);

export const selectGraphShowBestFit = createSelector(
  [selectElectricityReadingClient],
  (electricityReadingClient) => electricityReadingClient.graphShowBestFit
);