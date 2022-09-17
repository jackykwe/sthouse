import { UserReadDTO } from "services/users";
import { OperationType } from "types";
import { createAsyncSelectorUtil } from "utils/sliceUtils";
import { GET_USER, initialState, SLICE_NAME } from "./server-slice";

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
