import { commonAxiosErrorHandler } from "services/common-error-handler";
import { appAxios, BACKEND_API_URL } from "..";
import { ExportRequestReadDTO, HistoricalExportRequestReadDTO } from "./types";

const BASE_URL = `${BACKEND_API_URL}/api/export`;

export const axiosGetExportRequest = async (accessToken: string) => {
  try {
    const request = `${BASE_URL}/request`;
    const response = await appAxios.get<ExportRequestReadDTO>(request, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    return commonAxiosErrorHandler(error);
  }
};

export const axiosGetHistoricalExportRequest = async (accessToken: string) => {
  try {
    const request = `${BASE_URL}/historical/request`;
    const response = await appAxios.get<HistoricalExportRequestReadDTO>(
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
