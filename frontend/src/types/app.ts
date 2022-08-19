export const isRequestError = <T>(
  obj: RequestError | T
): obj is RequestError => {
  return (obj as RequestError).requestErrorDescription !== undefined;
};

export interface RequestError {
  requestErrorCode?: number;
  requestErrorDescription: string;
}

export interface AsyncState<T> {
  isLoading: boolean;
  error: RequestError | null;
  data: T | null;
}

export enum OperationType {
  Queries = "queries",
  Mutations = "mutations",
}
