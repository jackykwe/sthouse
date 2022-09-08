import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormHelperText } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { useElectricityReadingServerSlice } from "./store";

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
  const dispatch = useDispatch();
  const {
    actions: {
      createElectricityReadingRequest,
      resetCreateElectricityReadingState,
    },
    selectors: {
      selectCreateElectricityReadingLoading,
      selectCreateElectricityReadingData,
    },
  } = useElectricityReadingServerSlice();
  const createElectricityReadingLoading = useSelector(
    selectCreateElectricityReadingLoading
  );
  const createElectricityReadingData = useSelector(
    selectCreateElectricityReadingData
  );

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const imageFilePreviewURLMemo = useMemo(
    () => (imageFile !== null ? URL.createObjectURL(imageFile) : ""),
    [imageFile]
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const { control, handleSubmit } =
    useForm<ElectricityReadingCreatePageFormValues>();

  useEffect(() => {
    if (
      !createElectricityReadingLoading &&
      createElectricityReadingData !== null
    ) {
      dispatch(resetCreateElectricityReadingState());
      navigate(generateElectricityDetailPath(createElectricityReadingData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createElectricityReadingData, createElectricityReadingLoading]);

  const onSubmit: SubmitHandler<
    ElectricityReadingCreatePageFormValues
  > = async (data) => {
    dispatch(
      createElectricityReadingRequest({
        low_kwh: parseFloat(data.low_kwh), // assumed to never fail, since react-hook-form validated
        normal_kwh: parseFloat(data.normal_kwh), // assumed to never fail, since react-hook-form validated
        creator_name: "TODO IDENTITY",
        creator_email: "todoidentity@example.com",
        image: imageFile!, // assumed non-null, since react-hook-form validated
        setUploadProgress,
      })
    );
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
          loading={createElectricityReadingLoading}
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
    </>
  );
};

export default ElectricityReadingCreatePage;
