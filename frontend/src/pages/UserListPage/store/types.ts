import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";

export interface UserServerState {
  [OperationType.Queries]: {
    getUserList: AsyncState<UserReadDTO[]>;
  };
}

export type GetUserListRequestActionArg = undefined; // TODO: Pagination
