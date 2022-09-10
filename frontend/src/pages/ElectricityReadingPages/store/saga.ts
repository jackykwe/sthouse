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

// function* createElectricityReading({
//   payload,
// }: Payload<CreateElectricityReadingRequestActionArg>) {
//   const responseData: number | RequestError = yield call(
//     axiosCreateElectricityReading,
//     payload.low_kwh,
//     payload.normal_kwh,
//     payload.creator_name,
//     payload.creator_email,
//     payload.image,
//     payload.setUploadProgress // TODO? Change this to dispatch. May not need cos no prop drilling
//   );
//   if (isRequestError(responseData)) {
//     yield put(
//       electricityReadingServerActions.createElectricityReadingFailure(
//         responseData
//       )
//     );
//   } else {
//     yield put(
//       electricityReadingServerActions.createElectricityReadingSuccess(
//         responseData
//       )
//     );
//   }
// }

export function* electricityReadingServerSaga() {
  yield takeLatest(
    electricityReadingServerActions.getElectricityReadingListRequest,
    getElectricityReadingList
  );
}
