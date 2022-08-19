import axios, { AxiosError } from "axios";
import { RequestError } from "types";

export const commonAxiosErrorHandler = (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    (error as AxiosError).response !== undefined
  ) {
    return {
      requestErrorCode: error.response!.status,
      requestErrorDescription: `${error.response!.status} ${
        error.response!.statusText
      } ${error.response!.data}`,
    } as RequestError;
  }
  return {
    requestErrorDescription: "Unknown error encountered",
  } as RequestError;
};
