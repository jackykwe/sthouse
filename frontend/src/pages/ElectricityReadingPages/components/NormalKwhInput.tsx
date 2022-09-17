import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Control,
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
} from "react-hook-form";

interface NormalKwhInputProps<
  T extends FieldValues,
  NameT extends FieldPath<T>,
  DefaultValueT extends FieldPathValue<T, NameT>
> {
  fullWidth: boolean;
  name: NameT;
  control: Control<T>;
  defaultValue: DefaultValueT;
}

export const NormalKwhInput = <
  T extends FieldValues,
  NameT extends FieldPath<T>,
  DefaultValueT extends FieldPathValue<T, NameT>
>(
  props: NormalKwhInputProps<T, NameT, DefaultValueT>
) => {
  const { fullWidth, name, control, defaultValue } = props;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          fullWidth={fullWidth}
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
              <InputAdornment position="end">
                <Typography
                  color={(theme) =>
                    fieldState.error !== undefined
                      ? theme.palette.error.main
                      : theme.palette.text.secondary
                  }
                >
                  kWh
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      )}
      defaultValue={defaultValue} // suppress controlled/uncontrolled warning
      rules={{
        required: "Must not be empty",
        // v are strings, as defined in the XFormValues interface at use sites
        validate: {
          // these checks are performed in order
          // https://github.com/react-hook-form/react-hook-form/issues/1387#issuecomment-612375557
          nonNegative: (v) => parseFloat(v) >= 0 || "Cannot be negative",
          maxOneDp: (v) => /^\d*.?\d?$/.test(v) || "Only 1 d.p. allowed",
          notOverflow: (v) => parseFloat(v) < 100_000 || "Too big",
        },
      }}
    />
  );
};
