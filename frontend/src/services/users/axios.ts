import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
import { UserReadDTO } from "./types";

const BASE_URL = `${BACKEND_API_URL}/api/user`;

export const axiosGetUser = async (accessToken: string) => {
  try {
    const request = BASE_URL;
    const response = await appAxios.get<UserReadDTO>(request, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

export const axiosUpdateUser = async (
  new_display_name: string,
  accessToken: string
) => {
  try {
    const request = BASE_URL;
    await appAxios.put<void>(
      request,
      { new_display_name },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return 0;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};
