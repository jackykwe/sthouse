import { call, put, takeLatest } from "redux-saga/effects";
import { axiosGetUser, UserReadDTO } from "services/users";
import { isRequestError, RequestError } from "types";
import { Payload } from "utils/sliceUtils";
import { userServerActions } from "./server-slice";
import { GetUserRequestActionArg } from "./types";

function* getUser({ payload }: Payload<GetUserRequestActionArg>) {
  const responseData: UserReadDTO | RequestError = yield call(
    axiosGetUser,
    payload.accessToken
  );
  if (isRequestError(responseData)) {
    yield put(userServerActions.getUserFailure(responseData));
  } else {
    yield put(userServerActions.getUserSuccess(responseData));
  }
}

export function* userServerSaga() {
  yield takeLatest(userServerActions.getUserRequest, getUser);
}
