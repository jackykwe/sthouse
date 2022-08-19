import {
  AnyAction,
  combineReducers,
  configureStore,
  Reducer,
} from "@reduxjs/toolkit";
import { createInjectorsEnhancer } from "redux-injectors";
import createSagaMiddleware from "redux-saga";
import { RootState } from "types";

// Merges the main reducer with the router state and dynamically injected reducers
// This function is called once every time a reducer is injected (useXServerSlice())
const createReducerUtil = (
  injectedReducers: {
    [P in keyof RootState]?: Reducer<Required<RootState>[P], AnyAction>;
  } = {}
) => {
  if (Object.keys(injectedReducers).length === 0) {
    return (state: any) => state; // important on first load; any is a workaround // TODO
  }
  return combineReducers({ ...injectedReducers }); // this syntax makes a copy, might be important
};

export const configureAppStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const { run: runSaga } = sagaMiddleware;
  const middlewares = [sagaMiddleware];
  const enhancers = [
    createInjectorsEnhancer({
      createReducer: createReducerUtil,
      runSaga,
    }),
  ];
  return configureStore({
    reducer: createReducerUtil(),
    middleware: (gDM) => gDM().concat(...middlewares),
    enhancers,
    devTools: {
      shouldHotReload: false,
    },
    preloadedState: {}, // important, otherwise the state object (of type RootState) can be undefined
  });
};
