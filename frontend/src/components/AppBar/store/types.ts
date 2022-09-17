import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";

export interface UserServerState {
  [OperationType.Queries]: {
    getUser: AsyncState<UserReadDTO>;
  };
}

export type GetUserRequestActionArg = { accessToken: string };
export type GetUserSuccessActionArg = UserReadDTO;
