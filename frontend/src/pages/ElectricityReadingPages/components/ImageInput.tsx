import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import {
  Control,
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
} from "react-hook-form";

interface ImageInputProps<
  T extends FieldValues,
  NameT extends FieldPath<T>,
  DefaultValueT extends FieldPathValue<T, NameT>
> {
  fullWidth: boolean;
  name: NameT;
  control: Control<T>;
  defaultValue: DefaultValueT;
  buttonText: string;
  nullImageAllowed: boolean;
  setImageFile: React.Dispatch<React.SetStateAction<Blob | null>>;
}

export const ImageInput = <
  T extends FieldValues,
  NameT extends FieldPath<T>,
  DefaultValueT extends FieldPathValue<T, NameT>
>(
  props: ImageInputProps<T, NameT, DefaultValueT>
) => {
  const {
    fullWidth,
    name,
    control,
    defaultValue,
    buttonText,
    nullImageAllowed,
    setImageFile,
  } = props;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button
            fullWidth={fullWidth}
            endIcon={<PhotoCameraIcon />}
            component="label"
            size="large"
            variant="outlined"
            color={fieldState.error !== undefined ? "error" : "primary"}
            sx={{ height: 56 }}
          >
            {buttonText}
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
          {nullImageAllowed ? null : (
            <FormHelperText error={fieldState.error !== undefined}>
              {fieldState.error?.message ?? ""}
            </FormHelperText>
          )}
        </Box>
      )}
      defaultValue={defaultValue}
      rules={{
        required: nullImageAllowed ? undefined : "Please select an image",
      }}
    />
  );
};
