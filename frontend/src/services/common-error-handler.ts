import axios, { AxiosError } from "axios";
import { RequestError } from "types";

export const commonAxiosErrorHandler = (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    (error as AxiosError).response !== undefined
  ) {
    switch (error.response!.status) {
      // Historical artefact: 401s occurred due to rate limiting. Shouldn't occur now,
      // unless more than 10 people sign up together within a 12s window (/userinfo
      // endpoint bucket limit +1 every 12s, because +5 every 60s)
      case 401:
        return {
          requestErrorCode: 401,
          requestErrorDescription:
            `Please try again later. If error persists, please report this bug. ` +
            (error.response!.data !== undefined
              ? ` (${error.response!.data})`
              : ""),
        } as RequestError;
      case 404:
        return {
          requestErrorCode: 404,
          requestErrorDescription:
            `[404 Not Found]` +
            (error.response!.data !== undefined &&
            !(error.response!.data instanceof ArrayBuffer)
              ? ` (${error.response!.data})`
              : ""),
        } as RequestError;
      default:
        return {
          requestErrorCode: error.response!.status,
          requestErrorDescription:
            error.response!.status !== 0
              ? `[${error.response!.status} ${error.response!.statusText}]` +
                (error.response!.data !== undefined
                  ? ` (${error.response!.data})`
                  : "")
              : "Unable to reach backend",
        } as RequestError;
    }
  }
  return {
    requestErrorDescription: "Unknown error encountered",
  } as RequestError;
};
