import {
  ActionCreatorWithPayload,
  ActionReducerMapBuilder,
  createAction,
  createSelector,
  Draft,
} from "@reduxjs/toolkit";
import { AsyncState, OperationType, RequestError, RootState } from "types";

export const asyncInitialState: AsyncState<unknown> = {
  isLoading: false,
  data: null,
  error: null,
};

export interface Payload<T> {
  payload: T;
}

type UnwrapAsyncState<T> = T extends AsyncState<infer U> ? U : never;

/**
 * Completely type checked, once `SliceNameT` is provided
 * @template SliceNameT inferred
 * @template OperationTypeT inferred
 * @template StateNameT inferred
 * @template AsyncDataT inferred
 * @template DataT inferred
 */
export const createAsyncSelectorUtil =
  <DataT>() =>
  <
    SliceNameT extends keyof RootState,
    OperationTypeT extends keyof NonNullable<RootState[SliceNameT]> &
      OperationType,
    StateNameT extends keyof NonNullable<RootState[SliceNameT]>[OperationTypeT],
    AsyncDataT extends NonNullable<
      RootState[SliceNameT]
    >[OperationTypeT][StateNameT] &
      AsyncState<DataT>
  >(
    sliceName: SliceNameT,
    operationType: OperationTypeT,
    stateName: StateNameT,
    initialState: NonNullable<RootState[SliceNameT]>
  ) => {
    const selectServerState = (state: RootState) =>
      state[sliceName] ?? initialState;

    const selectState = createSelector<[typeof selectServerState], AsyncDataT>(
      [selectServerState],
      // screw TS
      // This is semi-justified: I'm exposing a type-safe interface and using unsafe code within
      // so calling code is still well-disciplined
      (state) => (state as any)[operationType][stateName] as AsyncDataT
    );
    const selectLoading = createSelector(
      [selectState],
      (asyncState) => asyncState.isLoading
    );
    const selectData = createSelector(
      [selectState],
      (asyncState) => asyncState.data
    );
    const selectError = createSelector(
      [selectState],
      (asyncState) => asyncState.error
    );
    return { selectState, selectLoading, selectError, selectData };
  };

/**
 * Completely type checked. Curried function as a workaround to achieve partial type inference.
 * @template RequestArgT required
 */
export const createAsyncActionUtil =
  <RequestArgT extends object | undefined>() =>
  <
    SliceNameT extends keyof RootState,
    OperationTypeT extends keyof NonNullable<RootState[SliceNameT]> &
      OperationType,
    ActionNameT extends keyof NonNullable<
      RootState[SliceNameT]
    >[OperationTypeT] &
      string
  >(
    sliceName: SliceNameT,
    operationType: OperationTypeT,
    actionName: ActionNameT
  ) => {
    const requestAction = createAction<RequestArgT>(
      `${sliceName}/${operationType}/${actionName}/request`
    );
    const successAction = createAction<
      UnwrapAsyncState<
        NonNullable<RootState[SliceNameT]>[OperationTypeT][ActionNameT]
      >
    >(`${sliceName}/${operationType}/${actionName}/success`);
    const failureAction = createAction<RequestError>(
      `${sliceName}/${operationType}/${actionName}/failure`
    );
    return { requestAction, successAction, failureAction };
  };

/**
 * Completely type checked. Curried function as a workaround to achieve partial type inference.
 * @template RequestArgT required
 */
export const createAsyncReducerBuilderUtil =
  <RequestArgT extends object | undefined>() =>
  <
    ServerState,
    OperationTypeT extends keyof Draft<ServerState> & OperationType,
    StateNameT extends keyof Draft<ServerState>[OperationTypeT],
    AsyncDataT extends Draft<ServerState>[OperationTypeT][StateNameT] &
      AsyncState<DataT>,
    DataT
  >(
    extraReducersBuilder: ActionReducerMapBuilder<ServerState>,
    operationType: OperationTypeT,
    stateName: StateNameT,
    requestAction: ActionCreatorWithPayload<RequestArgT, string> | undefined,
    successAction: ActionCreatorWithPayload<DataT, string> | undefined,
    failureAction: ActionCreatorWithPayload<RequestError, string> | undefined
  ) => {
    if (requestAction !== undefined) {
      extraReducersBuilder.addCase(requestAction, (state, action) => {
        (state[operationType][stateName] as AsyncDataT).isLoading = true;
      });
    }
    if (successAction !== undefined) {
      extraReducersBuilder.addCase(successAction, (state, action) => {
        (state[operationType][stateName] as AsyncDataT).isLoading = false;
        (state[operationType][stateName] as AsyncDataT).data = action.payload;
        (state[operationType][stateName] as AsyncDataT).error = null;
      });
    }
    if (failureAction !== undefined) {
      extraReducersBuilder.addCase(failureAction, (state, action) => {
        (state[operationType][stateName] as AsyncDataT).isLoading = false;
        (state[operationType][stateName] as AsyncDataT).data = null;
        (state[operationType][stateName] as AsyncDataT).error = action.payload;
      });
    }
    return extraReducersBuilder;
  };
