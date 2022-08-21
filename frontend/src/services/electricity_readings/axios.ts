import { commonAxiosErrorHandler } from "services/common-error-handler";
import appAxios, { BACKEND_API_URL } from "..";
import { ElectricityReadingReadGraphDTO } from "./types";

const BASE_URLS = `${BACKEND_API_URL}/api/electricity_readings`;

/**
 * Backend returns a list sorted by timestamp
 */
export const axiosGetAllElectricityReadings = async (
  startUnixTsMillisInc?: number,
  endUnixTsMillisInc?: number
) => {
  try {
    const request = BASE_URLS;
    const response = await appAxios.get<ElectricityReadingReadGraphDTO[]>(
      request,
      {
        params: {
          start_unix_ts_millis_inc: startUnixTsMillisInc,
          end_unix_ts_millis_inc: endUnixTsMillisInc,
        },
      }
    );
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
