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
import { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { axiosCreateElectricityReading } from "services/electricity_readings";
import { isRequestError } from "types";

// Most of this page's skeleton is from ElectricityReadingCreatePage.

interface ElectricityReadingDetailEditPageFormValues {
  low_kwh: string;
  normal_kwh: string;
  image: string;
}

export const ElectricityReadingDetailEditPage = () => {
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );

  const [electricityReadingsUploading, setElectricityReadingsUploading] =
    useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [electricityReadingsError, setElectricityReadingsError] = useState<
    string | null
  >(null);

  const { control, handleSubmit } =
    useForm<ElectricityReadingDetailEditPageFormValues>();

  const onSubmit: SubmitHandler<
    ElectricityReadingDetailEditPageFormValues
  > = async (data) => {
    setElectricityReadingsUploading(true);
    setUploadProgress(0);
    setErrorSnackbarOpen(false);
    setElectricityReadingsError(null);
    const responseData = await axiosCreateElectricityReading(
      parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
      parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
      "TODO IDENTITY",
      "todoidentity@example.com",
      imageFile!, // assumed non-null, since react-hook-form validated
      setUploadProgress
    );
    if (isRequestError(responseData)) {
      setElectricityReadingsError(responseData.requestErrorDescription);
      setErrorSnackbarOpen(true);
    } else {
      // responseData is the new ID of the newly created entry
      navigate(generateElectricityDetailPath(responseData));
    }
    setElectricityReadingsUploading(false);
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
              helperText={fieldState.error?.message ?? ""}
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
              helperText={fieldState.error?.message ?? ""}
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
          loading={electricityReadingsUploading}
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
          flexGrow: 1,
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
            style={{ objectFit: "scale-down" }}
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
          Submission failed: {electricityReadingsError}. Please try again later.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingDetailEditPage;
