import { ElectricityReadingReadDTO } from "services/electricity_readings";
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
      ElectricityReadingReadDTO[]
    >,
  },
  [OperationType.Mutations]: {
    [CREATE_ELECTRICITY_READING]: asyncInitialState as AsyncState<
      ElectricityReadingReadDTO[]
    >,
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
  reducers: {},
  extraReducers: (builder) => {
    createAsyncReducerBuilderUtil<GetElectricityReadingListRequestActionArg>()(
      builder,
      OperationType.Queries,
      GET_ELECTRICITY_READING_LIST,
      getElectricityReadingListRequest,
      getElectricityReadingListSuccess,
      getElectricityReadingListFailure
    );
    createAsyncReducerBuilderUtil<CreateElectricityReadingRequestActionArg>()(
      builder,
      OperationType.Mutations,
      CREATE_ELECTRICITY_READING,
      createElectricityReadingRequest,
      undefined,
      createElectricityReadingFailure
    );
    builder.addCase(createElectricityReadingSuccess, (state, action) => {
      state[OperationType.Mutations][CREATE_ELECTRICITY_READING].isLoading =
        false;
      state[OperationType.Mutations][CREATE_ELECTRICITY_READING].data =
        action.payload;
      state[OperationType.Mutations][CREATE_ELECTRICITY_READING].error = null;
      state[OperationType.Queries][GET_ELECTRICITY_READING_LIST].data =
        action.payload; // TODO: check
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
