import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useUserServerSlice } from "components/AppBar/store";
import { SubmitButton } from "components/SubmitButton";
import _ from "lodash";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  DATE_FMTSTR_HMDMY,
  DATE_FMTSTR_HMSDDMY_TZ,
  formatMillisInTzUtil,
} from "utils/dateUtils";

interface ProfilePageFormValues {
  new_display_name: string;
}

export const ProfilePage = () => {
  // GENERAL HOOKS (verbatim from DetailPage.tsx)
  const dispatch = useDispatch();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // HOOKS FOR FETCHING DATA (verbatim from AuthenticatedAppBar.tsx)
  // Server redux state selectors
  const {
    actions: { updateUserSuccessHandled, getUserRequest, updateUserRequest },
    selectors: {
      selectGetUserData,
      selectGetUserError,
      selectUpdateUserLoading,
      selectUpdateUserData,
      selectUpdateUserError,
    },
  } = useUserServerSlice();
  const getUserData = useSelector(selectGetUserData);
  const getUserError = useSelector(selectGetUserError);
  const updateUserLoading = useSelector(selectUpdateUserLoading);
  const updateUserData = useSelector(selectUpdateUserData);
  const updateUserError = useSelector(selectUpdateUserError);
  useEffect(() => {
    if (updateUserError !== null) {
      setUploadCompleteSnackbarOpen(false);
      setErrorSnackbarOpen(true);
    }
  }, [updateUserError]);

  const getUser = async () => {
    setErrorSnackbarOpen(false);
    const accessToken = await getAccessTokenSilently();
    dispatch(getUserRequest({ accessToken }));
  };
  const debouncedGetUser = _.debounce(getUser, 300);
  useEffect(() => {
    debouncedGetUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // purely for displaying new value only
  useEffect(() => {
    if (getUserData !== null) {
      setNewInput(getUserData.display_name);
    }
  }, [getUserData]);

  // HOOKS FOR UPLOADING
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [uploadCompleteSnackbarOpen, setUploadCompleteSnackbarOpen] =
    useState(false);
  useEffect(() => {
    if (updateUserData !== null) {
      dispatch(updateUserSuccessHandled());
      debouncedGetUser();
      setErrorSnackbarOpen(false);
      setUploadCompleteSnackbarOpen(true); // NB this is async
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateUserData]);

  // FORM HOOKS
  const [newInput, setNewInput] = useState(""); // purely for displaying new value only
  const { control, handleSubmit } = useForm<ProfilePageFormValues>();

  // DATE STATE
  const displayedDateMillis = useMemo(() => Date.now(), []);

  // EARLY RETURNS
  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  if (getUserError !== null) {
    return <PageError errorMessage={getUserError.requestErrorDescription} />;
  }

  if (getUserData === null) {
    return <PageLoading />;
  }

  const onSubmit: SubmitHandler<ProfilePageFormValues> = async (data) => {
    setErrorSnackbarOpen(false);
    setUploadCompleteSnackbarOpen(false);
    const accessToken = await getAccessTokenSilently();
    dispatch(
      updateUserRequest({ newDisplayName: data.new_display_name, accessToken })
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: (theme) => theme.spacing(1),
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
        }}
      >
        <Typography>Current Preview: </Typography>
        <Box
          sx={{
            maxWidth: "100%",
            display: "flex",
            gap: (theme) => theme.spacing(1),
          }}
        >
          <Typography color={grey[500]} fontStyle="italic">
            Submitted by{" "}
          </Typography>
          <Typography fontWeight={700} color={grey[500]} fontStyle="italic">
            {getUserData.display_name}
          </Typography>
          <Typography color={grey[500]} fontStyle="italic">
            {" "}
            on{" "}
          </Typography>
          <Typography
            fontWeight={700}
            color={grey[500]}
            fontStyle="italic"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {formatMillisInTzUtil(displayedDateMillis, DATE_FMTSTR_HMSDDMY_TZ)}
          </Typography>
          <Typography
            fontWeight={700}
            color={grey[500]}
            fontStyle="italic"
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            {formatMillisInTzUtil(displayedDateMillis, DATE_FMTSTR_HMDMY)}
          </Typography>
        </Box>
      </Box>

      {newInput !== getUserData.display_name ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
          }}
        >
          <Typography>New Preview: </Typography>
          <Box
            sx={{
              maxWidth: "100%",
              display: "flex",
              gap: (theme) => theme.spacing(1),
              alignSelf: "end",
            }}
          >
            <Typography color={grey[500]} fontStyle="italic">
              Submitted by{" "}
            </Typography>
            <Typography fontWeight={700} color={grey[500]} fontStyle="italic">
              {newInput}
            </Typography>
            <Typography color={grey[500]} fontStyle="italic">
              {" "}
              on{" "}
            </Typography>
            <Typography
              fontWeight={700}
              color={grey[500]}
              fontStyle="italic"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {formatMillisInTzUtil(
                displayedDateMillis,
                DATE_FMTSTR_HMSDDMY_TZ
              )}
            </Typography>
            <Typography
              fontWeight={700}
              color={grey[500]}
              fontStyle="italic"
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              {formatMillisInTzUtil(displayedDateMillis, DATE_FMTSTR_HMDMY)}
            </Typography>
          </Box>
        </Box>
      ) : null}

      <Controller
        name="new_display_name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="New Display Name"
            type="text"
            variant="outlined"
            value={field.value}
            error={fieldState.error !== undefined}
            helperText={fieldState.error?.message ?? ""}
            onChange={(event) => {
              setNewInput(event.target.value);
              field.onChange(event);
            }}
            onBlur={field.onBlur}
            sx={{ marginTop: (theme) => theme.spacing(1) }}
          />
        )}
        defaultValue={getUserData.display_name} // suppress controlled/uncontrolled warning
        rules={{ required: "Must not be empty" }}
      />
      <SubmitButton
        fullWidth={false}
        loading={updateUserLoading}
        progress={100}
        onClick={handleSubmit(onSubmit)}
        sx={{ width: 232 }}
      />

      {updateUserError !== null ? (
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
            Submission failed: {updateUserError.requestErrorDescription}
          </Alert>
        </Snackbar>
      ) : null}
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
          Update success!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
