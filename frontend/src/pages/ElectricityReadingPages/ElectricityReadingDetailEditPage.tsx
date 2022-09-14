import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormHelperText } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { NotFoundPageLazy } from "pages";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { generateElectricityDetailPath, routeEnum } from "routes/RouteEnum";
import { BACKEND_API_URL } from "services";
import {
  axiosDeleteElectricityReading,
  axiosGetElectricityReading,
  axiosUpdateElectricityReading,
  ElectricityReadingReadFullDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import { DATE_FMTSTR_HMSDDMY_TZ, formatMillisInTzUtil } from "utils/dateUtils";
import { isValidParam, responseIs404 } from "./utils";

// Most of this page's skeleton is from ElectricityReadingCreatePage.

interface ElectricityReadingDetailEditPageFormValues {
  low_kwh: string;
  normal_kwh: string;
  image: string;
}

export const ElectricityReadingDetailEditPage = () => {
  // GENERAL HOOKS
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAccessTokenSilently } = useAuth0();

  // HOOKS FOR FETCHING DATA
  const [readingLoading, setReadingLoading] = useState(false);
  const [readingData, setReadingData] =
    useState<ElectricityReadingReadFullDTO | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);

  const getReading = async (id: number) => {
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
      setReadingLoading(true);
      debouncedGetReading(parseInt(id));
      setReadingLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HOOKS FOR UPLOADING
  const [readingUploading, setReadingUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  // HOOKS FOR DELETING
  const [readingDeleting, setReadingDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // HOOKS FOR UPLOADING AND DELETING
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [readingUploadError, setReadingUploadError] = useState<string | null>(
    null
  );

  // FORM HOOKS
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );
  const { control, handleSubmit } =
    useForm<ElectricityReadingDetailEditPageFormValues>();

  // EARLY RETURNS
  if (id === undefined || !isValidParam(id) || responseIs404(readingError)) {
    return <NotFoundPageLazy />;
  }

  if (readingError !== null) {
    return <PageError errorMessage={readingError} />;
  }

  if (readingLoading || readingData === null) {
    return <PageLoading />;
  }

  const onSubmit: SubmitHandler<
    ElectricityReadingDetailEditPageFormValues
  > = async (data) => {
    setReadingUploading(true);
    setUploadProgress(0);
    setErrorSnackbarOpen(false);
    setReadingError(null);
    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosUpdateElectricityReading(
      parseInt(id),
      parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
      parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
      imageFile, // if null, no new file will be uploaded
      setUploadProgress,
      accessToken
    );
    if (isRequestError(responseData)) {
      setReadingUploadError(responseData.requestErrorDescription);
      setErrorSnackbarOpen(true);
    } else {
      navigate(generateElectricityDetailPath(parseInt(id)));
    }
    setReadingUploading(false);
  };

  const onDelete = async () => {
    setReadingDeleting(true);
    setErrorSnackbarOpen(false);
    setReadingError(null);
    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosDeleteElectricityReading(
      parseInt(id),
      accessToken
    );
    if (isRequestError(responseData)) {
      setReadingUploadError(responseData.requestErrorDescription);
      setErrorSnackbarOpen(true);
    } else {
      navigate(routeEnum.ElectricityGraph.path);
    }
    setReadingDeleting(false);
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
          {formatMillisInTzUtil(
            readingData.creation_unix_ts_millis,
            DATE_FMTSTR_HMSDDMY_TZ
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
          defaultValue={readingData.low_kwh.toString()} // suppress controlled/uncontrolled warning
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
          defaultValue={readingData.normal_kwh.toString()} // suppress controlled/uncontrolled warning
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
                Change Photo
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
          loading={readingUploading}
          loadingIndicator={
            uploadProgress < 100 ? (
              <CircularProgress
                variant="determinate"
                color="primary"
                value={uploadProgress}
              />
            ) : (
              <CircularProgress color="primary" />
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
        <Button
          disableElevation
          onClick={() => setDeleteDialogOpen(true)}
          variant="contained"
          color="secondary"
          sx={{ height: 56 }}
        >
          Delete
        </Button>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete this entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action is irreversible.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            loading={readingDeleting}
            loadingIndicator={<CircularProgress color="secondary" size={24} />}
            disableElevation
            onClick={onDelete}
            variant="contained"
            color="secondary"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
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
          Submission failed: {readingUploadError}. Please try again later.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingDetailEditPage;
