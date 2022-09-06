import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormHelperText } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useElectricityReadingServerSlice } from "./store";
interface ElectricityReadingCreatePageFormValues {
  low_kwh: number;
  normal_kwh: number;
  image: Blob;
}

/**
 * Image preview courtesy of
 * https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa
 *
 * Image fitting to container courtesy of
 * https://stackoverflow.com/a/41775258
 */
export const ElectricityReadingCreatePage = () => {
  const dispatch = useDispatch();
  const {
    actions: { createElectricityReadingRequest },
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState<string>("");

  const { control, handleSubmit } =
    useForm<ElectricityReadingCreatePageFormValues>();

  const onSubmit: SubmitHandler<
    ElectricityReadingCreatePageFormValues
  > = async (data) => {
    dispatch(
      createElectricityReadingRequest({
        low_kwh: data.low_kwh,
        normal_kwh: data.normal_kwh,
        creator_name: "TODO IDENTITY",
        creator_email: "todoidentity@example.com",
        image: data.image,
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
                    // if (event.target.files === null || event.target.files.item(0) === null) {
                    //   setImageFile(null);
                    // return;
                    // }
                    // const compressed = await compressAccurately(event.target.files.item(0)!, {size: 200, width: 1080});
                    // setImageFile(compressed);
                    setImageFile(event.target.files?.item(0) ?? null);
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
          rules={{ required: "Please select an image" }}
        />
        <LoadingButton
          loading={createElectricityReadingLoading}
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
            src={URL.createObjectURL(imageFile)}
            alt="Preview of electricty reading"
            style={{ objectFit: "scale-down" }}
          />
        ) : (
          <span>No image selected</span>
        )}
      </Box>
      Progress: {uploadProgress}
      <br />
      Response: {response}
    </>
  );
};

export default ElectricityReadingCreatePage;
