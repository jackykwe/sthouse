import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
import { UserReadDTO } from "./types";

const BASE_URLS = `${BACKEND_API_URL}/api/users`;

export const axiosGetAllUsers = async () => {
  try {
    const request = BASE_URLS;
    const response = await appAxios.get<UserReadDTO[]>(request);
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

// export const getProtectedResource = async (
//     accessToken: string
//   ): Promise<ApiResponse> => {
//     const config: AxiosRequestConfig = {
//       url: `${apiServerUrl}/api/messages/protected`,
//       method: "GET",
//       headers: {
//         "content-type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     };

//     const { data, error } = (await callExternalApi({ config })) as ApiResponse;

//     return {
//       data,
//       error,
//     };
//   };
