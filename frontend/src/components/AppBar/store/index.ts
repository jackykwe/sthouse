import { useInjectReducerUtil, useInjectSagaUtil } from "utils/redux-injectors";
import { userServerSaga } from "./saga";
import * as userServerSelectors from "./server-selectors";
import {
  userServerActions,
  userServerName,
  userServerReducer,
} from "./server-slice";

export const useUserServerSlice = () => {
  useInjectReducerUtil({
    key: userServerName,
    reducer: userServerReducer,
  });
  useInjectSagaUtil({
    key: userServerName,
    saga: userServerSaga,
  });
  return {
    actions: userServerActions,
    name: userServerName,
    selectors: userServerSelectors,
  };
};
