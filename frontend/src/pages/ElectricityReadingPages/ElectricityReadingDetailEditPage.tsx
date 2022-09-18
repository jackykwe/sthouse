import { useAuth0 } from "@auth0/auth0-react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LoadingButton from "@mui/lab/LoadingButton";
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
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Unstable_Grid2";
import _ from "lodash";
import { NotFoundPageLazy } from "pages";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useStore } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { generateElectricityDetailPath, routeEnum } from "routes/RouteEnum";
import {
  axiosDeleteElectricityReading,
  axiosGetElectricityReading,
  axiosGetElectricityReadingImage,
  axiosUpdateElectricityReading,
  ElectricityReadingReadFullDTO,
} from "services/electricity_readings";
import { isRequestError, RootState } from "types";
import { DATE_FMTSTR_HMSDDMY_TZ, formatMillisInTzUtil } from "utils/dateUtils";
import { SubmitButton } from "../../components/SubmitButton";
import { DeleteButton } from "./components/DeleteButton";
import { ImageInput } from "./components/ImageInput";
import { LowKwhInput } from "./components/LowKwhInput";
import { NormalKwhInput } from "./components/NormalKwhInput";
import { useElectricityReadingClientSlice } from "./store";
import { isValidParam, responseIs404 } from "./utils";

// Most of this page's skeleton is from ElectricityReadingCreatePage.

interface ElectricityReadingDetailEditPageFormValues {
  low_kwh: string;
  normal_kwh: string;
  image: string;
}

export const ElectricityReadingDetailEditPage = () => {
  // GENERAL HOOKS (verbatim from DetailPage.tsx)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { id } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Client redux state selectors
  const {
    actions: { setIsOnDetailEditPage },
  } = useElectricityReadingClientSlice();
  const store = useStore<RootState>();

  // HOOKS FOR FETCHING DATA (verbatim from DetailPage.tsx)
  const [readingData, setReadingData] =
    useState<ElectricityReadingReadFullDTO | null>(null);
  const [readingError, setReadingError] = useState<string | null>(null);
  // For image
  const [imageBase64, setImageBase64] = useState("");
  const [imageErrorSnackbarOpen, setImageErrorSnackbarOpen] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const getReading = async (id: number) => {
    if (!isAuthenticated) return;

    setImageErrorSnackbarOpen(false);
    setImageError(null);
    const accessToken = await getAccessTokenSilently();
    // Fetch data
    const responseData = await axiosGetElectricityReading(id, accessToken);
    if (isRequestError(responseData)) {
      setReadingError(responseData.requestErrorDescription);
      return;
    } else {
      setReadingData(responseData);
    }
    // Fetch image
    const newImageBase64 = await axiosGetElectricityReadingImage(
      id,
      accessToken
    );
    if (isRequestError(newImageBase64)) {
      setImageError(newImageBase64.requestErrorDescription);
      setImageErrorSnackbarOpen(true);
    } else {
      setImageBase64(newImageBase64);
    }
  };
  const debouncedGetReading = _.debounce(getReading, 300);
  useEffect(() => {
    dispatch(setIsOnDetailEditPage(true));
    if (id !== undefined && isValidParam(id)) {
      debouncedGetReading(parseInt(id));
    }
    return () => {
      dispatch(setIsOnDetailEditPage(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HOOKS FOR UPLOADING (verbatim from CreatePage.tsx)
  const [readingUploading, setReadingUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadCompleteSnackbarOpen, setUploadCompleteSnackbarOpen] =
    useState(false);
  useEffect(() => {
    if (uploadProgress === 100) {
      setUploadCompleteSnackbarOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress]);
  // HOOKS FOR DELETING
  const [readingDeleting, setReadingDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  // HOOKS FOR UPLOADING AND DELETING (verbatim from CreatePage.tsx)
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [readingUploadError, setReadingUploadError] = useState<string | null>(
    null
  );

  // FORM HOOKS (verbatim from CreatePage.tsx)
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );
  const { control, handleSubmit } =
    useForm<ElectricityReadingDetailEditPageFormValues>();

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
    return <PageLoading />;
  }

  const onSubmit: SubmitHandler<
    ElectricityReadingDetailEditPageFormValues
  > = async (data) => {
    setReadingUploading(true);
    setUploadProgress(0);
    setUploadCompleteSnackbarOpen(false);
    setErrorSnackbarOpen(false);
    setReadingUploadError(null);
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
      if (
        store.getState().electricityReadingClient?.noSelector_isOnDetailEditPage
      ) {
        navigate(generateElectricityDetailPath(parseInt(id)));
      }
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
      <Box>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{
            display: { xs: "none", md: "flex" },
            position: "absolute",
          }}
          onClick={() => navigate(generateElectricityDetailPath(parseInt(id)))}
        >
          Abort changes
        </Button>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{
            display: { xs: "flex", md: "none" },
            marginBottom: (theme) => theme.spacing(1),
            padding: 0,
          }}
          onClick={() => navigate(generateElectricityDetailPath(parseInt(id)))}
        >
          Abort changes
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignSelf: "center",
          marginBottom: (theme) => theme.spacing(2),
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
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "start",
          gap: (theme) => theme.spacing(1),
          marginBottom: (theme) => theme.spacing(2),
        }}
      >
        <LowKwhInput
          fullWidth={false}
          name="low_kwh"
          control={control}
          defaultValue={readingData.low_kwh.toString()}
        />
        <NormalKwhInput
          fullWidth={false}
          name="normal_kwh"
          control={control}
          defaultValue={readingData.normal_kwh.toString()}
        />
        <ImageInput
          fullWidth={false}
          name="image"
          control={control}
          defaultValue=""
          buttonText="Change Photo"
          nullImageAllowed={true}
          setImageFile={setImageFile}
        />
        <SubmitButton
          fullWidth={false}
          loading={readingUploading}
          progress={uploadProgress}
          onClick={handleSubmit(onSubmit)}
        />
        <DeleteButton
          fullWidth={false}
          onClick={() => setDeleteDialogOpen(true)}
        />
      </Box>

      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: (theme) => theme.spacing(1),
          marginBottom: (theme) => theme.spacing(2),
        }}
      >
        <Grid2 container spacing={1}>
          <Grid2 xs={6}>
            <LowKwhInput
              fullWidth={true}
              name="low_kwh"
              control={control}
              defaultValue={readingData.low_kwh.toString()}
            />
          </Grid2>
          <Grid2 xs={6}>
            <NormalKwhInput
              fullWidth={true}
              name="normal_kwh"
              control={control}
              defaultValue={readingData.normal_kwh.toString()}
            />
          </Grid2>
          <Grid2 xs={6}>
            <ImageInput
              fullWidth={true}
              name="image"
              control={control}
              defaultValue=""
              buttonText="Change Photo"
              nullImageAllowed={true}
              setImageFile={setImageFile}
            />
          </Grid2>
          <Grid2 xs={3}>
            <SubmitButton
              fullWidth={true}
              loading={readingUploading}
              progress={uploadProgress}
              onClick={handleSubmit(onSubmit)}
            />
          </Grid2>
          <Grid2 xs={3}>
            <DeleteButton
              fullWidth={true}
              onClick={() => setDeleteDialogOpen(true)}
            />
          </Grid2>
        </Grid2>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: imageFile === null && imageBase64 === "" ? 1 : 0,
          justifyContent: "center",
          alignItems: "normal",
          minHeight: 0,
        }}
      >
        {imageFile !== null ? (
          // From CreatePage.tsx
          <img
            src={imageFilePreviewURLMemo}
            alt="Preview of electricty reading"
            style={{ maxWidth: "100%", objectFit: "scale-down" }}
          />
        ) : imageBase64 === "" ? (
          <Skeleton
            animation={imageError !== null ? false : "wave"}
            variant="rectangular"
            sx={{ width: "100%", height: "100%" }}
          />
        ) : (
          <img
            // src={`${BACKEND_API_URL}/api/electricity_readings/images/compressed/${id}.jpg`}
            src={`data:image/jpeg;base64,${imageBase64}`}
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
          Failed to fetch image: {imageError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={uploadCompleteSnackbarOpen}
        onClose={() => {}} // disable timeout, clickaway and escapeKeyDown from closing snackbar
      >
        <Alert
          variant="filled"
          severity="success"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setUploadCompleteSnackbarOpen(false)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Upload complete! You may wait for redirect, or safely leave this page.
        </Alert>
      </Snackbar>
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
          Submission failed: {readingUploadError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ElectricityReadingDetailEditPage;
