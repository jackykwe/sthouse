import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
import {
  ElectricityReadingReadFullDTO,
  ElectricityReadingReadGraphDTO,
} from "./types";

const BASE_URLS = `${BACKEND_API_URL}/api/electricity_readings`;

export const axiosCreateElectricityReading = async (
  low_kwh: number,
  normal_kwh: number,
  imageFile: Blob,
  creator_name: string,
  creator_email: string,
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
    const response = await appAxios.post<number>(request, formData, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
      },
    });
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

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

export const axiosGetElectricityReading = async (id: number) => {
  try {
    const request = `${BASE_URLS}/${id}`;
    const response = await appAxios.get<ElectricityReadingReadFullDTO>(request);
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

export const axiosUpdateElectricityReading = async (
  id: number,
  low_kwh: number,
  normal_kwh: number,
  imageFile: Blob | null,
  modifier_name: string,
  modifier_email: string,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    const formData = new FormData();
    formData.append("low_kwh", low_kwh.toString());
    formData.append("normal_kwh", normal_kwh.toString());
    formData.append("modifier_name", modifier_name);
    formData.append("modifier_email", modifier_email);
    if (imageFile !== null) {
      formData.append("image", imageFile);
    }
    const request = `${BASE_URLS}/${id}`;
    await appAxios.put<void>(request, formData, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
      },
    });
    return 0;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

// TODO: TRANSMIT IDENTITY FROM FRONTEND TO BACKEND
export const axiosDeleteElectricityReading = async (
  id: number,
  _modifier_name: string,
  _modifier_email: string
) => {
  try {
    const request = `${BASE_URLS}/${id}`;
    await appAxios.delete<void>(request);
    return 0;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
