import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
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

export const axiosCreateElectricityReading = async (
  low_kwh: number,
  normal_kwh: number,
  creator_name: string,
  creator_email: string,
  imageFile: Blob,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const formData = new FormData();
    formData.append("low_kwh", low_kwh.toString());
    formData.append("normal_kwh", normal_kwh.toString());
    formData.append("creator_name", creator_name);
    formData.append("creator_email", creator_email);
    formData.append("image", imageFile);
    const request = BASE_URLS;
    const response = await appAxios.post<ElectricityReadingReadGraphDTO>(
      request,
      formData,
      {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
        },
      }
    );
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
