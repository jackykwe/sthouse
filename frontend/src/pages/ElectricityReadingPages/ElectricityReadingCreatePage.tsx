import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Grid2 from "@mui/material/Unstable_Grid2";
import { PageError } from "pages/PageError/PageError";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { axiosCreateElectricityReading } from "services/electricity_readings";
import { isRequestError } from "types";
import { ImageInput } from "./components/ImageInput";
import { LowKwhInput } from "./components/LowKwhInput";
import { NormalKwhInput } from "./components/NormalKwhInput";
import { SubmitButton } from "./components/SubmitButton";

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
  // GENERAL HOOKS
  const navigate = useNavigate();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR UPLOADING
  const [readingUploading, setReadingUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [readingUploadError, setReadingUploadError] = useState<string | null>(
    null
  );
  const [uploadCompleteSnackbarOpen, setUploadCompleteSnackbarOpen] =
    useState(false);
  useEffect(() => {
    if (uploadProgress === 100) {
      setUploadCompleteSnackbarOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadProgress]);

  // FORM HOOKS
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );
  const { control, handleSubmit } =
    useForm<ElectricityReadingCreatePageFormValues>();

  const onSubmit: SubmitHandler<
    ElectricityReadingCreatePageFormValues
  > = async (data) => {
    setReadingUploading(true);
    setUploadProgress(0);
    setErrorSnackbarOpen(false);
    setReadingUploadError(null);
    setUploadCompleteSnackbarOpen(false);
    const accessToken = await getAccessTokenSilently(); // if not authenticated, will throw exn
    const responseData = await axiosCreateElectricityReading(
      parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
      parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
      imageFile!, // assumed non-null, since react-hook-form validated
      setUploadProgress,
      accessToken
    );
    if (isRequestError(responseData)) {
      setReadingUploadError(responseData.requestErrorDescription);
      setUploadCompleteSnackbarOpen(false); // errors will override success
      setErrorSnackbarOpen(true);
    } else {
      // responseData is the new ID of the newly created entry
      navigate(generateElectricityDetailPath(responseData));
    }
    setReadingUploading(false);
  };

  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  return (
    <>
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
          defaultValue=""
        />
        <NormalKwhInput
          fullWidth={false}
          name="normal_kwh"
          control={control}
          defaultValue=""
        />
        <ImageInput
          fullWidth={false}
          name="image"
          control={control}
          defaultValue=""
          buttonText="Select Photo"
          nullImageAllowed={false}
          setImageFile={setImageFile}
        />
        <SubmitButton
          fullWidth={false}
          loading={readingUploading}
          progress={uploadProgress}
          onClick={handleSubmit(onSubmit)}
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
              defaultValue=""
            />
          </Grid2>
          <Grid2 xs={6}>
            <NormalKwhInput
              fullWidth={true}
              name="normal_kwh"
              control={control}
              defaultValue=""
            />
          </Grid2>
          <Grid2 xs={8}>
            <ImageInput
              fullWidth={true}
              name="image"
              control={control}
              defaultValue=""
              buttonText="Select Photo"
              nullImageAllowed={false}
              setImageFile={setImageFile}
            />
          </Grid2>
          <Grid2 xs={4}>
            <SubmitButton
              fullWidth={true}
              loading={readingUploading}
              progress={uploadProgress}
              onClick={handleSubmit(onSubmit)}
            />
          </Grid2>
        </Grid2>
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
            style={{ maxWidth: "100%", objectFit: "scale-down" }}
          />
        ) : (
          <span>No image selected</span>
        )}
      </Box>

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
              onClick={() => setErrorSnackbarOpen(false)}
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

export default ElectricityReadingCreatePage;
