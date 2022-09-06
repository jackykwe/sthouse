import { useInjectReducerUtil, useInjectSagaUtil } from "utils/redux-injectors";
import * as electricityReadingClientSelectors from "./client-selectors";
import {
  electricityReadingClientActions,
  electricityReadingClientName,
  electricityReadingClientReducer,
} from "./client-slice";
import { electricityReadingServerSaga } from "./saga";
import * as electricityReadingServerSelectors from "./server-selectors";
import {
  electricityReadingServerActions,
  electricityReadingServerName,
  electricityReadingServerReducer,
} from "./server-slice";

export const useElectricityReadingClientSlice = () => {
  useInjectReducerUtil({
    key: electricityReadingClientName,
    reducer: electricityReadingClientReducer,
  });
  return {
    actions: electricityReadingClientActions,
    name: electricityReadingClientName,
    selectors: electricityReadingClientSelectors,
  };
};

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
