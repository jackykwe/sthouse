import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { NotFoundPageLazy } from "pages";
import { FetchingData } from "pages/FetchingData/FetchingData";
import { PageError } from "pages/PageError/PageError";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateElectricityDetailEditPath } from "routes/RouteEnum";
import { BACKEND_API_URL } from "services";
import {
  axiosGetElectricityReading,
  ElectricityReadingReadFullDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import {
  DATE_FMTSTR_HMDMY,
  DATE_FMTSTR_HMSDDMY_TZ,
  formatMillisInTzUtil,
} from "utils/dateUtils";
import { isValidParam, responseIs404 } from "./utils";

export const ElectricityReadingDetailPage = () => {
  // GENERAL HOOKS
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR FETCHING DATA
  // For JSON data
  const [readingData, setReadingData] =
    useState<ElectricityReadingReadFullDTO | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);
  // For image
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageErrorSnackbarOpen, setImageErrorSnackbarOpen] = useState(false);

  const getReading = async (id: number) => {
    if (!isAuthenticated) return;

    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosGetElectricityReading(id, accessToken);
    if (isRequestError(responseData)) {
      setReadingError(responseData.requestErrorDescription);
    } else {
      setReadingData(responseData);
    }
  };
  const debouncedGetReading = _.debounce(getReading, 300);
  useEffect(() => {
    if (id !== undefined && isValidParam(id)) {
      debouncedGetReading(parseInt(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EARLY RETURNS
  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  if (id === undefined || !isValidParam(id) || responseIs404(readingError)) {
    return <NotFoundPageLazy />;
  }

  if (readingError !== null) {
    return <PageError errorMessage={readingError} />;
  }

  if (readingData === null) {
    return <FetchingData />;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignSelf: "center",
          marginBottom: (theme) => theme.spacing(1),
        }}
      >
        <Typography variant="h4">On </Typography>
        <Typography variant="h4" fontWeight={700}>
          {formatMillisInTzUtil(
            readingData.creation_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
          )}
        </Typography>
      </Box>

      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box sx={{ display: "flex", gap: (theme) => theme.spacing(1) }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <Typography variant="h5">Low reading (kWh) was </Typography>
            <Typography variant="h5">Normal reading (kWh) was </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Jetbrains Mono"
              align="right"
            >
              {readingData.low_kwh.toFixed(1)}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Jetbrains Mono"
              align="right"
            >
              {readingData.normal_kwh.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="large"
          color="primary"
          sx={{
            marginX: (theme) => theme.spacing(2),
            color: (theme) =>
              theme.palette.mode === "light" ? grey[300] : grey[800],
            ":hover": {
              color: (theme) =>
                theme.palette.mode === "light"
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            },
          }}
          onClick={() =>
            navigate(generateElectricityDetailEditPath(parseInt(id)))
          }
        >
          <EditIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: imageLoaded ? 0 : 1,
          justifyContent: "center",
          alignItems: "normal",
          minHeight: 0,
          marginY: (theme) => theme.spacing(1),
        }}
      >
        <img
          src={`${BACKEND_API_URL}/electricity_readings/images/compressed/${id}.jpg?image_token=${readingData.image_token}`}
          alt={`${id}.jpg`}
          style={{
            display: imageLoaded ? "flex" : "none",
            objectFit: "scale-down",
            maxWidth: "100%",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageErrorSnackbarOpen(true);
          }}
        />
        {!imageLoaded ? (
          <Skeleton
            animation={imageError ? false : "wave"}
            variant="rectangular"
            sx={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          maxWidth: "100%",
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignSelf: "end",
        }}
      >
        <Typography
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          Submitted by{" "}
        </Typography>
        <Tooltip placement="top" title={readingData.creator_email}>
          <Typography
            fontWeight={700}
            color={(theme) =>
              theme.palette.mode === "light" ? grey[300] : grey[800]
            }
            fontStyle="italic"
          >
            {readingData.creator_name}
          </Typography>
        </Tooltip>
        <Typography
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          {" "}
          on{" "}
        </Typography>
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {formatMillisInTzUtil(
            readingData.creation_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
          )}
        </Typography>
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          {formatMillisInTzUtil(
            readingData.creation_unix_ts_millis,
            DATE_FMTSTR_HMDMY
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          maxWidth: "100%",
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignSelf: "end",
        }}
      >
        <Typography
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          Last modified by{" "}
        </Typography>
        <Tooltip
          arrow
          placement="top"
          title={readingData.latest_modifier_email}
        >
          <Typography
            fontWeight={700}
            color={(theme) =>
              theme.palette.mode === "light" ? grey[300] : grey[800]
            }
            fontStyle="italic"
          >
            {readingData.latest_modifier_name}
          </Typography>
        </Tooltip>
        <Typography
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          {" "}
          on{" "}
        </Typography>
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {formatMillisInTzUtil(
            readingData.latest_modification_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
          )}
        </Typography>
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          {formatMillisInTzUtil(
            readingData.latest_modification_unix_ts_millis,
            DATE_FMTSTR_HMDMY
          )}
        </Typography>
      </Box>

      <Snackbar
        open={imageErrorSnackbarOpen}
        onClose={() => {}} // disable timeout, clickaway and escapeKeyDown from closing snackbar
      >
        <Alert
          variant="filled"
          severity="error"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setImageErrorSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Failed to fetch image. Please report this bug!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingDetailPage;
