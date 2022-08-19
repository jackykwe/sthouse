import { call, put, takeLatest } from "redux-saga/effects";
import {
  axiosGetAllElectricityReadings,
  ElectricityReadingReadDTO,
} from "services/electricity_readings";
import { isRequestError, RequestError } from "types";
import { Payload } from "utils/sliceUtil";
import { electricityReadingServerActions } from "./server-slice";
import { GetElectricityReadingListRequestActionArg } from "./types";

function* getElectricityReadingList({
  payload,
}: Payload<GetElectricityReadingListRequestActionArg>) {
  const responseData: ElectricityReadingReadDTO[] | RequestError = yield call(
    axiosGetAllElectricityReadings
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
