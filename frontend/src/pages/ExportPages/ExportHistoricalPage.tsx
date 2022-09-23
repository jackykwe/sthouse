import { useAuth0 } from "@auth0/auth0-react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { FetchingData } from "pages/FetchingData/FetchingData";
import { PageError } from "pages/PageError/PageError";
import { useEffect, useState } from "react";
import { BACKEND_API_URL } from "services";
import {
  axiosGetHistoricalExportRequest,
  HistoricalExportRequestReadDTO,
} from "services/export";
import { isRequestError } from "types";

export const ExportHistoricalPage = () => {
  // GENERAL HOOKS
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR FETCHING DATA
  const [exportRequestData, setexportRequestData] =
    useState<HistoricalExportRequestReadDTO | null>(null);
  const [exportRequestError, setExportRequestError] = useState<string | null>(
    null
  );
  const getExportRequest = async () => {
    if (!isAuthenticated) return;

    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosGetHistoricalExportRequest(accessToken);
    if (isRequestError(responseData)) {
      setExportRequestError(responseData.requestErrorDescription);
    } else {
      setexportRequestData(responseData);
    }
  };
  const debouncedGetExportRequest = _.debounce(getExportRequest, 300);
  useEffect(() => {
    debouncedGetExportRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EARLY RETURNS
  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  if (exportRequestError !== null) {
    return <PageError errorMessage={exportRequestError} />;
  }

  if (exportRequestData === null) {
    return <FetchingData />;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: (theme) => theme.spacing(1),
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Click</Typography>
        <Typography fontFamily="Jetbrains Mono" fontWeight={700}>
          <Link
            href={`${BACKEND_API_URL}/export/historical/json?export_token=${exportRequestData.export_token}`}
            target="_blank" // new tab
            rel="noreferrer"
          >
            here
          </Link>
        </Typography>
        <Typography variant="h5">for text data.</Typography>
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}
      >
        {exportRequestData.image_ids.map((id) => (
          <Typography key={id} fontFamily="Jetbrains Mono" fontWeight={700}>
            <Link
              href={`${BACKEND_API_URL}/export/historical/images/original/${id}.png?image_token=${exportRequestData.export_token}`}
              target="_blank" // new tab
              rel="noreferrer"
            >
              {id}.png
            </Link>
          </Typography>
        ))}
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}
      >
        {exportRequestData.tombstone_image_ids.map((id) => (
          <Typography key={id} fontFamily="Jetbrains Mono" fontWeight={700}>
            <Link
              href={`${BACKEND_API_URL}/export/historical/images/original/${id}_tombstone.png?image_token=${exportRequestData.export_token}`}
              target="_blank" // new tab
              rel="noreferrer"
            >
              {id}_tombstone.png
            </Link>
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default ExportHistoricalPage;
