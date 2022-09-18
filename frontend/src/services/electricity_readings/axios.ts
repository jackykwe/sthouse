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
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  accessToken: string
) => {
  try {
    const formData = new FormData();
    formData.append("low_kwh", low_kwh.toString());
    formData.append("normal_kwh", normal_kwh.toString());
    formData.append("image", imageFile);
    const request = BASE_URLS;
    const response = await appAxios.post<number>(request, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
  startUnixTsMillisInc: number | undefined,
  endUnixTsMillisInc: number | undefined,
  accessToken: string
) => {
  try {
    const request = BASE_URLS;
    const response = await appAxios.get<ElectricityReadingReadGraphDTO[]>(
      request,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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

export const axiosGetElectricityReading = async (
  id: number,
  accessToken: string
) => {
  try {
    const request = `${BASE_URLS}/${id}`;
    const response = await appAxios.get<ElectricityReadingReadFullDTO>(
      request,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

export const axiosGetElectricityReadingImage = async (
  id: number,
  accessToken: string
) => {
  try {
    const request = `${BASE_URLS}/images/compressed/${id}.jpg`;
    const response = await appAxios.get<ArrayBuffer>(request, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
    });
    const base64 = window.btoa(
      new Uint8Array(response.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    ); // deprecation workaround at https://stackoverflow.com/a/70733727
    return base64;
  } catch (error) {
    console.log(error);
    return commonAxiosErrorHandler(error);
  }
};

export const axiosGetLatestElectricityReadingMillis = async (
  accessToken: string
) => {
  try {
    const request = `${BASE_URLS}/latest`;
    const response = await appAxios.get<number>(request, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
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
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  accessToken: string
) => {
  try {
    const formData = new FormData();
    formData.append("low_kwh", low_kwh.toString());
    formData.append("normal_kwh", normal_kwh.toString());
    if (imageFile !== null) {
      formData.append("image", imageFile);
    }
    const request = `${BASE_URLS}/${id}`;
    await appAxios.put<void>(request, formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      onUploadProgress: (progressEvent: ProgressEvent) => {
        setUploadProgress((progressEvent.loaded / progressEvent.total) * 100);
      },
    });
    return 0;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

export const axiosDeleteElectricityReading = async (
  id: number,
  accessToken: string
) => {
  try {
    const request = `${BASE_URLS}/${id}`;
    await appAxios.delete<void>(request, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return 0;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
