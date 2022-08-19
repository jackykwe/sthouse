import { commonAxiosErrorHandler } from "services/common-error-handler";
import appAxios, { BACKEND_API_URL } from "..";
import { ElectricityReadingReadDTO } from "./types";

const BASE_URLS = `${BACKEND_API_URL}/api/electricity_readings`;

export const axiosGetAllElectricityReadings = async () => {
  try {
    const request = BASE_URLS;
    const response = await appAxios.get<ElectricityReadingReadDTO[]>(request);
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
