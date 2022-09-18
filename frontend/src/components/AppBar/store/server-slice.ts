import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";
import {
  asyncInitialState,
  createAsyncActionUtil,
  createAsyncReducerBuilderUtil,
} from "utils/sliceUtils";
import { createSliceUtil } from "utils/toolkit";
import {
  GetUserRequestActionArg,
  UpdateUserRequestActionArg,
  UserServerState,
} from "./types";

export const SLICE_NAME = "userServer";
export const GET_USER = "getUser";
export const UPDATE_USER = "updateUser";

export const initialState: UserServerState = {
  [OperationType.Queries]: {
    [GET_USER]: asyncInitialState as AsyncState<UserReadDTO>,
  },
  [OperationType.Mutations]: {
    [UPDATE_USER]: asyncInitialState as AsyncState<0>,
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

const {
  requestAction: updateUserRequest,
  successAction: updateUserSuccess,
  failureAction: updateUserFailure,
} = createAsyncActionUtil<UpdateUserRequestActionArg>()(
  SLICE_NAME,
  OperationType.Mutations,
  UPDATE_USER
);

const serverSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {
    updateUserSuccessHandled: (state) => {
      state[OperationType.Mutations]["updateUser"].data = null;
    },
  },
  extraReducers: (builder) => {
    createAsyncReducerBuilderUtil<GetUserRequestActionArg>()(
      builder,
      OperationType.Queries,
      GET_USER,
      getUserRequest,
      getUserSuccess,
      getUserFailure
    );
    createAsyncReducerBuilderUtil<UpdateUserRequestActionArg>()(
      builder,
      OperationType.Mutations,
      UPDATE_USER,
      updateUserRequest,
      updateUserSuccess,
      updateUserFailure
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
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
};
