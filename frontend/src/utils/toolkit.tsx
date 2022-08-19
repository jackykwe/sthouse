import {
  createSlice,
  CreateSliceOptions,
  SliceCaseReducers,
} from "@reduxjs/toolkit";
import { RootState } from "types";

export const createSliceUtil = <
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends keyof RootState // enforces this
>(
  options: CreateSliceOptions<State, CaseReducers, Name>
) => {
  return createSlice(options);
};
