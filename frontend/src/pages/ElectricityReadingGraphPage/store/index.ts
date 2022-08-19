import { useInjectReducerUtil, useInjectSagaUtil } from "utils/redux-injectors";
import { electricityReadingServerSaga } from "./saga";
import * as electricityReadingServerSelectors from "./server-selectors";
import {
  electricityReadingServerActions,
  electricityReadingServerName,
  electricityReadingServerReducer,
} from "./server-slice";

export const useElectricityReadingServerSlice = () => {
  useInjectReducerUtil({
    key: electricityReadingServerName,
    reducer: electricityReadingServerReducer,
  });
  useInjectSagaUtil({
    key: electricityReadingServerName,
    saga: electricityReadingServerSaga,
  });
  return {
    actions: electricityReadingServerActions,
    name: electricityReadingServerName,
    selectors: electricityReadingServerSelectors,
  };
};
