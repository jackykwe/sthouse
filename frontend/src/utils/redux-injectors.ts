import { AnyAction, Reducer } from "@reduxjs/toolkit";
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { Saga } from "redux-saga";
import { RootState } from "types";

export const useInjectReducerUtil = <Key extends keyof RootState>(params: {
  key: Key;
  reducer: Reducer<Required<RootState>[Key], AnyAction>;
  // eslint-disable-next-line react-hooks/rules-of-hooks
}) => useInjectReducer(params);

export const useInjectSagaUtil = (params: {
  key: keyof RootState;
  saga: Saga;
  // eslint-disable-next-line react-hooks/rules-of-hooks
}) => useInjectSaga(params);
