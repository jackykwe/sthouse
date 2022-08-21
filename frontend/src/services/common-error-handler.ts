import axios, { AxiosError } from "axios";
import { RequestError } from "types";

export const commonAxiosErrorHandler = (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    (error as AxiosError).response !== undefined
  ) {
    return {
      requestErrorCode: error.response!.status,
      requestErrorDescription:
        error.response!.status !== 0
          ? `${error.response!.status} ${error.response!.statusText} ${
              error.response!.data
            }`
          : "Unable to reach backend",
    } as RequestError;
  }
  return {
    requestErrorDescription: "Unknown error encountered",
  } as RequestError;
};
