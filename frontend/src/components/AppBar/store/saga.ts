import { call, put, takeLatest } from "redux-saga/effects";
import { axiosGetUser, axiosUpdateUser, UserReadDTO } from "services/users";
import { isRequestError, RequestError } from "types";
import { Payload } from "utils/sliceUtils";
import { userServerActions } from "./server-slice";
import { GetUserRequestActionArg, UpdateUserRequestActionArg } from "./types";

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

function* updateUser({ payload }: Payload<UpdateUserRequestActionArg>) {
  const responseData: 0 | RequestError = yield call(
    axiosUpdateUser,
    payload.newDisplayName,
    payload.accessToken
  );
  if (isRequestError(responseData)) {
    yield put(userServerActions.updateUserFailure(responseData));
  } else {
    yield put(userServerActions.updateUserSuccess(responseData));
  }
}

export function* userServerSaga() {
  yield takeLatest(userServerActions.getUserRequest, getUser);
  yield takeLatest(userServerActions.updateUserRequest, updateUser);
}
