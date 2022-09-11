import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormHelperText } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatInTimeZone } from "date-fns-tz";
import _ from "lodash";
import { NotFoundPageLazy } from "pages";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { BACKEND_API_URL } from "services";
import {
  axiosGetElectricityReading,
  axiosUpdateElectricityReading,
  ElectricityReadingReadFullDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import {
  DEFAULT_TARGET_TIME_ZONE,
  fromUnixTimeMillisUtil,
} from "utils/dateUtils";
import { isValidParam, responseIs404 } from "./ElectricityReadingDetailPage";

// Most of this page's skeleton is from ElectricityReadingCreatePage.

interface ElectricityReadingDetailEditPageFormValues {
  low_kwh: string;
  normal_kwh: string;
  image: string;
}

export const ElectricityReadingDetailEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );

  const [electricityReadingUploading, setElectricityReadingUploading] =
    useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [electricityReadingUploadError, setElectricityReadingUploadError] =
    useState<string | null>(null);

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

  const { control, handleSubmit } =
    useForm<ElectricityReadingDetailEditPageFormValues>();

  if (
    id === undefined ||
    !isValidParam(id) ||
    responseIs404(electricityReadingError)
  ) {
    return <NotFoundPageLazy />;
  }

  if (electricityReadingError !== null) {
    return <PageError errorMessage={electricityReadingError} />;
  }

  if (electricityReadingLoading || electricityReadingData === null) {
    return <PageLoading />;
  }

  const onSubmit: SubmitHandler<
    ElectricityReadingDetailEditPageFormValues
  > = async (data) => {
    setElectricityReadingUploading(true);
    setUploadProgress(0);
    setErrorSnackbarOpen(false);
    setElectricityReadingError(null);
    const responseData = await axiosUpdateElectricityReading(
      parseInt(id),
      parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
      parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
      imageFile, // if null, no new file will be uploaded
      "TODO IDENTITY",
      "todoidentity@example.com",
      setUploadProgress
    );
    if (isRequestError(responseData)) {
      setElectricityReadingUploadError(responseData.requestErrorDescription);
      setErrorSnackbarOpen(true);
    } else {
      console.log("OK");
      navigate(generateElectricityDetailPath(parseInt(id)));
    }
    setElectricityReadingUploading(false);
  };

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
          justifyContent: "center",
          alignItems: "start",
          gap: (theme) => theme.spacing(1),
          marginBottom: (theme) => theme.spacing(2),
        }}
      >
        <Controller
          name="low_kwh"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Low Reading"
              type="number"
              variant="outlined"
              value={field.value}
              error={fieldState.error !== undefined}
              helperText={fieldState.error?.message ?? " "}
              onChange={field.onChange}
              onBlur={field.onBlur}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kWh</InputAdornment>
                ),
              }}
            />
          )}
          defaultValue={electricityReadingData.low_kwh.toString()} // suppress controlled/uncontrolled warning
          rules={{ required: "Low Reading must not be empty" }}
        />
        <Controller
          name="normal_kwh"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              label="Normal Reading"
              type="number"
              variant="outlined"
              value={field.value}
              error={fieldState.error !== undefined}
              helperText={fieldState.error?.message ?? " "}
              onChange={field.onChange}
              onBlur={field.onBlur}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kWh</InputAdornment>
                ),
              }}
            />
          )}
          defaultValue={electricityReadingData.normal_kwh.toString()} // suppress controlled/uncontrolled warning
          rules={{ required: "Normal Reading must not be empty" }}
        />
        <Controller
          name="image"
          control={control}
          render={({ field, fieldState }) => (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Button
                endIcon={<PhotoCameraIcon />}
                component="label"
                size="large"
                variant="outlined"
                sx={{ height: 56 }}
              >
                Select Photo
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={async (event) => {
                    const fileOptional = event.target.files?.item(0);
                    setImageFile(fileOptional ?? null);
                    // does something to form state, idc. Able to trigger react-hook-form validation
                    // on change, s.t. red text shows up if null
                    field.onChange(event);
                  }}
                  onBlur={field.onBlur}
                />
              </Button>
              <FormHelperText> </FormHelperText>
            </Box>
          )}
          defaultValue={""}
        />
        <LoadingButton
          loading={electricityReadingUploading}
          loadingIndicator={
            uploadProgress < 100 ? (
              <CircularProgress variant="determinate" value={uploadProgress} />
            ) : (
              <CircularProgress />
            )
          }
          disableElevation
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          sx={{ height: 56 }}
        >
          SUBMIT
        </LoadingButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "normal",
          minHeight: 0,
        }}
      >
        {imageFile !== null ? (
          <img
            src={imageFilePreviewURLMemo}
            alt="Preview of electricty reading"
            style={{ objectFit: "scale-down", maxWidth: "100%" }}
          />
        ) : (
          <img
            src={`${BACKEND_API_URL}/api/electricity_readings/images/compressed/${id}.jpg`}
            alt={`Failed to fetch ${id}.jpg`}
            style={{ objectFit: "scale-down", maxWidth: "100%" }}
          />
        )}
      </Box>
      <Snackbar
        open={errorSnackbarOpen}
        onClose={() => {}} // disable timeout, clickaway and escapeKeyDown from closing snackbar
      >
        <Alert
          variant="filled"
          severity="error"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setErrorSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Submission failed: {electricityReadingUploadError}. Please try again
          later.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingDetailEditPage;
