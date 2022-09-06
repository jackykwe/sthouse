import { ElectricityReadingReadGraphDTO } from "services/electricity_readings";
import { AsyncState, OperationType } from "types";
import {
  asyncInitialState,
  createAsyncActionUtil,
  createAsyncReducerBuilderUtil,
} from "utils/sliceUtil";
import { createSliceUtil } from "utils/toolkit";
import {
  CreateElectricityReadingRequestActionArg,
  ElectricityReadingServerState,
  GetElectricityReadingListRequestActionArg,
} from "./types";

export const SLICE_NAME = "electricityReadingServer";
export const GET_ELECTRICITY_READING_LIST = "getElectricityReadingList";
export const CREATE_ELECTRICITY_READING = "createElectricityReading";

export const initialState: ElectricityReadingServerState = {
  [OperationType.Queries]: {
    [GET_ELECTRICITY_READING_LIST]: asyncInitialState as AsyncState<
      ElectricityReadingReadGraphDTO[]
    >,
  },
  [OperationType.Mutations]: {
    [CREATE_ELECTRICITY_READING]: asyncInitialState as AsyncState<number>,
  },
};

const {
  requestAction: getElectricityReadingListRequest,
  successAction: getElectricityReadingListSuccess,
  failureAction: getElectricityReadingListFailure,
} = createAsyncActionUtil<GetElectricityReadingListRequestActionArg>()(
  SLICE_NAME,
  OperationType.Queries,
  GET_ELECTRICITY_READING_LIST
);

const {
  requestAction: createElectricityReadingRequest,
  successAction: createElectricityReadingSuccess,
  failureAction: createElectricityReadingFailure,
} = createAsyncActionUtil<CreateElectricityReadingRequestActionArg>()(
  SLICE_NAME,
  OperationType.Mutations,
  CREATE_ELECTRICITY_READING
);

const serverSlice = createSliceUtil({
  name: SLICE_NAME,
  initialState,
  reducers: {
    resetElectricityReadingListData: (state) => {
      state[OperationType.Queries][GET_ELECTRICITY_READING_LIST].data = null;
    },
  },
  extraReducers: (builder) => {
    createAsyncReducerBuilderUtil<GetElectricityReadingListRequestActionArg>()(
      builder,
      OperationType.Queries,
      GET_ELECTRICITY_READING_LIST,
      undefined,
      getElectricityReadingListSuccess,
      getElectricityReadingListFailure
    );
    createAsyncReducerBuilderUtil<CreateElectricityReadingRequestActionArg>()(
      builder,
      OperationType.Mutations,
      CREATE_ELECTRICITY_READING,
      createElectricityReadingRequest,
      createElectricityReadingSuccess,
      createElectricityReadingFailure
    );
    builder.addCase(getElectricityReadingListRequest, (state, action) => {
      state[OperationType.Queries][GET_ELECTRICITY_READING_LIST].isLoading =
        true;
      state[OperationType.Queries][GET_ELECTRICITY_READING_LIST].error = null;
    });
  },
});

export const {
  reducer: electricityReadingServerReducer,
  name: electricityReadingServerName,
} = serverSlice;
const { actions } = serverSlice;
export const electricityReadingServerActions = {
  ...actions,
  getElectricityReadingListRequest,
  getElectricityReadingListSuccess,
  getElectricityReadingListFailure,
  createElectricityReadingRequest,
  createElectricityReadingSuccess,
  createElectricityReadingFailure,
};
