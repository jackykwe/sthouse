import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
import {
  ElectricityReadingCreateDTO,
  ElectricityReadingReadGraphDTO,
} from "./types";

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
  createDTO: ElectricityReadingCreateDTO,
  imageFile: Blob,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  setDownloadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const formData = new FormData();
    formData.append("electricityReadingCreateDTO", JSON.stringify(createDTO));
    formData.append("image", imageFile);
    const request = "https://httpbin.org/post";
    const response = await appAxios.post<object>(request, formData, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
      },
      onDownloadProgress: (progressEvent: ProgressEvent) => {
        setDownloadProgress((progressEvent.loaded / progressEvent.total) * 100);
      },
    });
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
