import { useInjectReducerUtil } from "utils/redux-injectors";
import * as electricityReadingClientSelectors from "./client-selectors";
import {
  electricityReadingClientActions,
  electricityReadingClientName,
  electricityReadingClientReducer,
} from "./client-slice";

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
