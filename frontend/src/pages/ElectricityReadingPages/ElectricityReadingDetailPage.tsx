// interface ElectricityReadingDetailPageProps {}

import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { formatInTimeZone } from "date-fns-tz";
import _ from "lodash";
import { NotFoundPageLazy } from "pages/NotFoundPage/NotFoundPageLazy";
import { PageLoading } from "pages/PageLoading/PageLoading";
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
  DEFAULT_TARGET_TIME_ZONE,
  fromUnixTimeMillisUtil,
} from "utils/dateUtils";

const isValidParam = (id: string) => /^\d+$/.test(id);

const responseIs404 = (error: string | null) =>
  error === null ? false : error === "404 Not Found ";

export const ElectricityReadingDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [electricityReadingLoading, setElectricityReadingLoading] =
    useState(false);
  const [electricityReadingData, setElectricityReadingData] =
    useState<ElectricityReadingReadFullDTO | null>(null);
  const [electricityReadingError, setElectricityReadingError] = useState<
    string | null
  >(null);

  const fetchData = async (id: number) => {
    const responseData = await axiosGetElectricityReading(id);
    if (isRequestError(responseData)) {
      setElectricityReadingError(responseData.requestErrorDescription);
    } else {
      setElectricityReadingData(responseData);
    }
  };
  const debouncedFetchData = _.debounce(fetchData, 300);

  useEffect(() => {
    if (id !== undefined && isValidParam(id)) {
      setElectricityReadingLoading(true);
      debouncedFetchData(parseInt(id));
      setElectricityReadingLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (
    id === undefined ||
    !isValidParam(id) ||
    responseIs404(electricityReadingError)
  ) {
    return <NotFoundPageLazy />;
  }

  if (electricityReadingLoading || electricityReadingData === null) {
    return <PageLoading />;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignSelf: "center",
        }}
      >
        <Typography variant="h4">On </Typography>
        <Typography variant="h4" fontWeight={700}>
          {formatInTimeZone(
            fromUnixTimeMillisUtil(
              electricityReadingData.creation_unix_ts_millis
            ),
            // timestamp saved into DB is unambiguous; this forces frontend to render
            // that timestamp as a Date in GMT/BST
            DEFAULT_TARGET_TIME_ZONE,
            "HH':'mm':'ss eee d MMM yyyy (O)"
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
              width={100}
              align="right"
            >
              {electricityReadingData.low_kwh.toFixed(1)}
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
              width={100}
              align="right"
            >
              {electricityReadingData.normal_kwh.toFixed(1)}
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
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "normal",
          minHeight: 0,
          margin: (theme) => theme.spacing(1),
        }}
      >
        <img
          src={`${BACKEND_API_URL}/api/electricity_readings/images/compressed/${id}.jpg`}
          alt={`Failed to fetch ${id}.jpg`}
          style={{ objectFit: "scale-down" }}
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
          {electricityReadingData.creator_name}
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
          {formatInTimeZone(
            fromUnixTimeMillisUtil(
              electricityReadingData.creation_unix_ts_millis
            ),
            // timestamp saved into DB is unambiguous; this forces frontend to render
            // that timestamp as a Date in GMT/BST
            DEFAULT_TARGET_TIME_ZONE,
            "HH':'mm':'ss eee d MMM yyyy (O)"
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
          {electricityReadingData.latest_modifier_name}
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
          {formatInTimeZone(
            fromUnixTimeMillisUtil(
              electricityReadingData.latest_modification_unix_ts_millis
            ),
            // timestamp saved into DB is unambiguous; this forces frontend to render
            // that timestamp as a Date in GMT/BST
            DEFAULT_TARGET_TIME_ZONE,
            "HH':'mm':'ss eee d MMM yyyy (O)"
          )}
        </Typography>
      </Box>
    </>
  );
};

export default ElectricityReadingDetailPage;
