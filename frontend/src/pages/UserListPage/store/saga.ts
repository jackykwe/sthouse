import { call, put, takeLatest } from "redux-saga/effects";
import { axiosGetAllUsers, UserReadDTO } from "services/users";
import { isRequestError, RequestError } from "types";
import { Payload } from "utils/sliceUtil";
import { userServerActions } from "./server-slice";
import { GetUserListRequestActionArg } from "./types";

function* getUserList({ payload }: Payload<GetUserListRequestActionArg>) {
  const responseData: UserReadDTO[] | RequestError = yield call(
    axiosGetAllUsers
  );
  if (isRequestError(responseData)) {
    yield put(userServerActions.getUserListFailure(responseData));
  } else {
    yield put(userServerActions.getUserListSuccess(responseData));
  }
}

export function* userServerSaga() {
  yield takeLatest(userServerActions.getUserListRequest, getUserList);
}
