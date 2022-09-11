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
import { PageError } from "pages/PageError/PageError";
import { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { axiosCreateElectricityReading } from "services/electricity_readings";
import { isRequestError } from "types";

interface ElectricityReadingCreatePageFormValues {
  low_kwh: string;
  normal_kwh: string;
  image: string;
}

/**
 * Image preview courtesy of
 * https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa
 *
 * Image fitting to container courtesy of
 * https://stackoverflow.com/a/41775258
 */
export const ElectricityReadingCreatePage = () => {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );

  const [electricityReadingUploading, setElectricityReadingUploading] =
    useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [electricityReadingError, setElectricityReadingError] = useState<
    string | null
  >(null);

  const { control, handleSubmit } =
    useForm<ElectricityReadingCreatePageFormValues>();

  if (electricityReadingError !== null) {
    return <PageError errorMessage={electricityReadingError} />;
  }

  const onSubmit: SubmitHandler<
    ElectricityReadingCreatePageFormValues
  > = async (data) => {
    setElectricityReadingUploading(true);
    setUploadProgress(0);
    setErrorSnackbarOpen(false);
    setElectricityReadingError(null);
    const responseData = await axiosCreateElectricityReading(
      parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
      parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
      imageFile!, // assumed non-null, since react-hook-form validated
      "TODO IDENTITY",
      "todoidentity@example.com",
      setUploadProgress
    );
    if (isRequestError(responseData)) {
      setElectricityReadingError(responseData.requestErrorDescription);
      setErrorSnackbarOpen(true);
    } else {
      // responseData is the new ID of the newly created entry
      navigate(generateElectricityDetailPath(responseData));
    }
    setElectricityReadingUploading(false);
  };

  return (
    <>
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
          defaultValue={""} // suppress controlled/uncontrolled warning
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
          defaultValue={""} // suppress controlled/uncontrolled warning
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
                color={fieldState.error !== undefined ? "error" : "primary"}
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
              <FormHelperText error={fieldState.error !== undefined}>
                {fieldState.error?.message ?? " "}
              </FormHelperText>
            </Box>
          )}
          defaultValue={""}
          rules={{ required: "Please select an image" }}
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
          flexGrow: imageFile !== null ? 0 : 1,
          display: "flex",
          justifyContent: "center",
          alignItems: imageFile !== null ? "normal" : "center",
          minHeight: 0,
        }}
      >
        {imageFile !== null ? (
          <img
            src={imageFilePreviewURLMemo}
            alt="Preview of electricty reading"
            style={{
              maxWidth: "100%",
              objectFit: "scale-down",
            }}
          />
        ) : (
          <span>No image selected</span>
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
          Submission failed: {electricityReadingError}. Please try again later.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingCreatePage;
