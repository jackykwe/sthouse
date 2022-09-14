// interface ElectricityReadingDetailPageProps {}

import { useAuth0 } from "@auth0/auth0-react";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { NotFoundPageLazy } from "pages";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateElectricityDetailEditPath } from "routes/RouteEnum";
import {
  axiosGetElectricityReading,
  axiosGetElectricityReadingImage,
  ElectricityReadingReadFullDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import { DATE_FMTSTR_HMSDDMY_TZ, formatMillisInTzUtil } from "utils/dateUtils";
import { isValidParam, responseIs404 } from "./utils";

export const ElectricityReadingDetailPage = () => {
  // GENERAL HOOKS
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR FETCHING DATA
  const [imageBase64, setImageBase64] = useState("");
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingData, setReadingData] =
    useState<ElectricityReadingReadFullDTO | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);

  const getReading = async (id: number) => {
    if (!isAuthenticated) return;

    const accessToken = await getAccessTokenSilently();
    // Fetch image
    const newImageBase64 = await axiosGetElectricityReadingImage(
      id,
      accessToken
    );
    if (isRequestError(newImageBase64)) {
      setReadingError(newImageBase64.requestErrorDescription);
      return;
    } else {
      setImageBase64(newImageBase64);
    }
    // Fetch data
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
      setReadingLoading(true);
      debouncedGetReading(parseInt(id));
      setReadingLoading(false);
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

  if (readingLoading || readingData === null) {
    return <PageLoading />;
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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              gap: (theme) => theme.spacing(1),
              alignSelf: "center",
            }}
          >
            <Typography variant="h5" width={285}>
              Low reading (kWh) was{" "}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Jetbrains Mono"
              width={112}
              align="right"
            >
              {readingData.low_kwh.toFixed(1)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: (theme) => theme.spacing(1),
              alignSelf: "center",
            }}
          >
            <Typography variant="h5" width={285}>
              Normal reading (kWh) was{" "}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="Jetbrains Mono"
              width={112}
              align="right"
            >
              {readingData.normal_kwh.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="large"
          color="primary"
          sx={{ marginX: (theme) => theme.spacing(2) }}
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
          justifyContent: "center",
          alignItems: "normal",
          minHeight: 0,
          marginY: (theme) => theme.spacing(1),
        }}
      >
        <img
          // src={`${BACKEND_API_URL}/api/electricity_readings/images/compressed/${id}.jpg`}
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt={`Failed to fetch ${id}.jpg`}
          style={{ objectFit: "scale-down", maxWidth: "100%" }}
        />
      </Box>

      <Box
        sx={{
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
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          {readingData.creator_name}
        </Typography>
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
        >
          {formatMillisInTzUtil(
            readingData.creation_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
          )}
        </Typography>
      </Box>

      <Box
        sx={{
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
        <Typography
          fontWeight={700}
          color={(theme) =>
            theme.palette.mode === "light" ? grey[300] : grey[800]
          }
          fontStyle="italic"
        >
          {readingData.latest_modifier_name}
        </Typography>
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
        >
          {formatMillisInTzUtil(
            readingData.latest_modification_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
          )}
        </Typography>
      </Box>
    </>
  );
};

export default ElectricityReadingDetailPage;
