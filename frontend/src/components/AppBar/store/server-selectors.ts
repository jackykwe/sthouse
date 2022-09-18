import { UserReadDTO } from "services/users";
import { OperationType } from "types";
import { createAsyncSelectorUtil } from "utils/sliceUtils";
import {
  GET_USER,
  initialState,
  SLICE_NAME,
  UPDATE_USER,
} from "./server-slice";

export const {
  selectLoading: selectGetUserLoading,
  selectError: selectGetUserError,
  selectData: selectGetUserData,
} = createAsyncSelectorUtil<UserReadDTO>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_USER,
  initialState
);

export const {
  selectLoading: selectUpdateUserLoading,
  selectError: selectUpdateUserError,
  selectData: selectUpdateUserData,
} = createAsyncSelectorUtil<UserReadDTO>()(
  SLICE_NAME,
  OperationType.Mutations,
  UPDATE_USER,
  initialState
);
