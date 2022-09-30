import { useAuth0 } from "@auth0/auth0-react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { FetchingData } from "pages/FetchingData/FetchingData";
import { PageError } from "pages/PageError/PageError";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeEnum } from "routes/RouteEnum";
import { BACKEND_API_URL } from "services";
import { axiosGetExportRequest, ExportRequestReadDTO } from "services/export";
import { isRequestError } from "types";

export const ExportPage = () => {
  // GENERAL HOOKS
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR FETCHING DATA
  const [exportRequestData, setexportRequestData] =
    useState<ExportRequestReadDTO | null>(null);
  const [exportRequestError, setExportRequestError] = useState<string | null>(
    null
  );
  const getExportRequest = async () => {
    if (!isAuthenticated) return;

    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosGetExportRequest(accessToken);
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
      <Collapse in={exportRequestData.eligible_for_historical}>
        <Alert
          severity="info"
          sx={{
            marginTop: (theme) => theme.spacing(2),
            width: { xs: "100%", md: "auto" },
          }}
        >
          <AlertTitle>
            <strong>Technical / Debugging</strong>
          </AlertTitle>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: (theme) => theme.spacing(0.5),
            }}
          >
            <Box sx={{ display: "flex" }}>
              <Typography align="center" lineHeight={1}>
                You may view more detailed export data
              </Typography>
              <Button
                disableRipple
                onClick={() => navigate(routeEnum["ExportHistorical"].path)}
                sx={{
                  textTransform: "none",
                  "&:hover": { backgroundColor: "transparent" },
                  height: 0,
                  minWidth: 0,
                  paddingLeft: (theme) => theme.spacing(0.5),
                  paddingRight: 0,
                  paddingTop: 1,
                }}
              >
                <Link>
                  <Typography align="center" lineHeight={1}>
                    here
                  </Typography>
                </Link>
              </Button>
              <Typography align="center" lineHeight={1}>
                .
              </Typography>
            </Box>
            <Typography align="center" lineHeight={1}>
              Includes deleted data and historical photos.
            </Typography>
          </Box>
        </Alert>
      </Collapse>

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
            href={`${BACKEND_API_URL}/export/json?export_token=${exportRequestData.export_token}`}
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
              href={`${BACKEND_API_URL}/export/images/original/${id}.png?image_token=${exportRequestData.export_token}`}
              target="_blank" // new tab
              rel="noreferrer"
            >
              {id}.png
            </Link>
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default ExportPage;
