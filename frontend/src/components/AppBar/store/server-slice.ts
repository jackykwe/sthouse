import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";
import {
  asyncInitialState,
  createAsyncActionUtil,
  createAsyncReducerBuilderUtil,
} from "utils/sliceUtils";
import { createSliceUtil } from "utils/toolkit";
import { GetUserRequestActionArg, UserServerState } from "./types";

export const SLICE_NAME = "userServer";
export const GET_USER = "getUser";

export const initialState: UserServerState = {
  [OperationType.Queries]: {
    [GET_USER]: asyncInitialState as AsyncState<UserReadDTO>,
  },
};

const {
  requestAction: getUserRequest,
  successAction: getUserSuccess,
  failureAction: getUserFailure,
} = createAsyncActionUtil<GetUserRequestActionArg>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_USER
);

const serverSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    createAsyncReducerBuilderUtil<GetUserRequestActionArg>()(
      builder,
      OperationType.Queries,
      GET_USER,
      getUserRequest,
      getUserSuccess,
      getUserFailure
    );
  },
});

export const { reducer: userServerReducer, name: userServerName } = serverSlice;
const { actions } = serverSlice;
export const userServerActions = {
  ...actions,
  getUserRequest,
  getUserSuccess,
  getUserFailure,
};
