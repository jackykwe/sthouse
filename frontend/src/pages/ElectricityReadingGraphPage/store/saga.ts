import { call, put, takeLatest } from "redux-saga/effects";
import {
  axiosGetAllElectricityReadings,
  ElectricityReadingReadGraphDTO,
} from "services/electricity_readings";
import { isRequestError, RequestError } from "types";
import { Payload } from "utils/sliceUtil";
import { electricityReadingServerActions } from "./server-slice";
import { GetElectricityReadingListRequestActionArg } from "./types";

function* getElectricityReadingList({
  payload,
}: Payload<GetElectricityReadingListRequestActionArg>) {
  const responseData: ElectricityReadingReadGraphDTO[] | RequestError =
    yield call(
      axiosGetAllElectricityReadings,
      payload.startUnixTsMillisInc,
      payload.endUnixTsMillisInc
    );
  if (isRequestError(responseData)) {
    yield put(
      electricityReadingServerActions.getElectricityReadingListFailure(
        responseData
      )
    );
  } else {
    yield put(
      electricityReadingServerActions.getElectricityReadingListSuccess(
        responseData
      )
    );
  }
}

export function* electricityReadingServerSaga() {
  yield takeLatest(
    electricityReadingServerActions.getElectricityReadingListRequest,
    getElectricityReadingList
  );
}
