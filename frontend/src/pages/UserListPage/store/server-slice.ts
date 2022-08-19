import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";
import {
  asyncInitialState,
  createAsyncActionUtil,
  createAsyncReducerBuilderUtil,
} from "utils/sliceUtil";
import { createSliceUtil } from "utils/toolkit";
import { GetUserListRequestActionArg, UserServerState } from "./types";

export const SLICE_NAME = "userServer";
export const GET_USER_LIST = "getUserList";

export const initialState: UserServerState = {
  [OperationType.Queries]: {
    [GET_USER_LIST]: asyncInitialState as AsyncState<UserReadDTO[]>,
  },
};

const {
  requestAction: getUserListRequest,
  successAction: getUserListSuccess,
  failureAction: getUserListFailure,
} = createAsyncActionUtil<GetUserListRequestActionArg>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_USER_LIST
);

const serverSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    createAsyncReducerBuilderUtil<GetUserListRequestActionArg>()(
      builder,
      OperationType.Queries,
      GET_USER_LIST,
      getUserListRequest,
      getUserListSuccess,
      getUserListFailure
    );
  },
});

export const { reducer: userServerReducer, name: userServerName } = serverSlice;
const { actions } = serverSlice;
export const userServerActions = {
  ...actions,
  getUserListRequest,
  getUserListSuccess,
  getUserListFailure,
};
