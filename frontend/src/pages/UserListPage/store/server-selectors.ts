import { UserReadDTO } from "services/users";
import { OperationType } from "types";
import { createAsyncSelectorUtil } from "utils/sliceUtil";
import { GET_USER_LIST, initialState, SLICE_NAME } from "./server-slice";

export const {
  selectLoading: selectGetUserListLoading,
  selectError: selectGetUserListError,
  selectData: selectGetUserListData,
} = createAsyncSelectorUtil<UserReadDTO[]>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_USER_LIST,
  initialState
);
