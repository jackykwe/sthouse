import { UserReadDTO } from "services/users";
import { AsyncState, OperationType } from "types";

export interface UserServerState {
  [OperationType.Queries]: {
    getUser: AsyncState<UserReadDTO>;
  };
  [OperationType.Mutations]: {
    updateUser: AsyncState<0>; // 0 serves as a consume-once signal for success
  };
}

export type GetUserRequestActionArg = { accessToken: string };
export type UpdateUserRequestActionArg = {
  newDisplayName: string;
  accessToken: string;
};
