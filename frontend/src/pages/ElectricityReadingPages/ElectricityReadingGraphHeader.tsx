import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Unstable_Grid2";
import { DatePicker } from "@mui/x-date-pickers";
import { addMilliseconds, endOfMonth, isValid, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DATE_PICKER_MAX_DATE,
  DATE_PICKER_MIN_DATE,
  DEFAULT_TARGET_TIME_ZONE,
  fromUnixTimeMillisUtil,
  generateDatePickerHelperTextUtil,
  // generateDatePickerHelperTextUtilDebug,
  getUnixTimeMillisUtil,
  isWithinAllowedIntervalUtil,
  systemReprToTsActualUtil,
  tsActualToSystemReprUtil,
} from "utils/dateUtils";
import { useElectricityReadingClientSlice } from "./store";

interface ElectricityReadingGraphHeaderProps {
  hasData: boolean; // Controls when the header is shown, and reset button.
  hasError: boolean; // Controls when the header is shown, and reset button.
}

export const ElectricityReadingGraphHeader = (
  props: ElectricityReadingGraphHeaderProps
) => {
  const { hasData, hasError } = props;
  const dispatch = useDispatch();

  // Client redux state selectors
  const {
    actions: {
      setGraphStartMillisActInc,
      setGraphEndMillisActInc,
      setGraphShowInterpolation,
    },
    selectors: {
      selectGraphStartMillisActInc,
      selectGraphEndMillisActInc,
      selectGraphShowInterpolation,
    },
  } = useElectricityReadingClientSlice();
  const graphStartMillisActInc = useSelector(selectGraphStartMillisActInc);
  const graphEndMillisActInc = useSelector(selectGraphEndMillisActInc);
  const graphShowInterpolation = useSelector(selectGraphShowInterpolation);

  // Client redux state derived
  const [fromPickerDate, setFromPickerDate] = useState<Date | null>(
    graphStartMillisActInc === null
      ? null
      : tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartMillisActInc),
          DEFAULT_TARGET_TIME_ZONE
        )
  ); // already -7h TS
  const [toPickerDate, setToPickerDate] = useState<Date | null>(
    tsActualToSystemReprUtil(
      fromUnixTimeMillisUtil(graphEndMillisActInc),
      DEFAULT_TARGET_TIME_ZONE
    )
  ); // already -7h TS

  useEffect(() => {
    if (fromPickerDate === null && graphStartMillisActInc !== null) {
      // console.log(
      //   "sts changed (not null) AND fromPickerDate is null: setting picker date to startOfMonth(sts)"
      // );
      setFromPickerDate(
        tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartMillisActInc),
          DEFAULT_TARGET_TIME_ZONE
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphStartMillisActInc]);

  if (graphStartMillisActInc === null || !hasData || hasError) {
    return <></>;
  }

  const fromPicker = (fullWidth: boolean) => (
    <DatePicker
      label="From (inclusive)"
      views={["year", "month"]}
      minDate={DATE_PICKER_MIN_DATE}
      maxDate={DATE_PICKER_MAX_DATE}
      onChange={(newDateSys) => {
        if (newDateSys !== null && isValid(newDateSys)) {
          const coercedDate = startOfMonth(newDateSys);
          if (isWithinAllowedIntervalUtil(coercedDate)) {
            // Hack: add milliseconds to force auto-correction of text input
            setFromPickerDate(addMilliseconds(coercedDate, 1));
            dispatch(
              setGraphStartMillisActInc(
                getUnixTimeMillisUtil(
                  systemReprToTsActualUtil(
                    coercedDate,
                    DEFAULT_TARGET_TIME_ZONE
                  )
                )
              )
            );
            return;
          }
        }
        setFromPickerDate(newDateSys); // UI turns red if invalid and non-empty
      }}
      value={fromPickerDate}
      renderInput={(params) => (
        <TextField
          fullWidth={fullWidth}
          helperText={generateDatePickerHelperTextUtil(fromPickerDate)}
          // helperText={generateDatePickerHelperTextUtilDebug(
          //   fromPickerDate,
          //   graphStartMillisActInc,
          //   DEFAULT_TARGET_TIME_ZONE
          // )}
          {...params}
        />
      )}
    />
  );
  const toPicker = (fullWidth: boolean) => (
    <DatePicker
      label="To (inclusive)"
      views={["year", "month"]}
      minDate={DATE_PICKER_MIN_DATE}
      maxDate={DATE_PICKER_MAX_DATE}
      onChange={(newDateSys) => {
        if (newDateSys !== null && isValid(newDateSys)) {
          const coercedDate = endOfMonth(newDateSys);
          if (isWithinAllowedIntervalUtil(coercedDate)) {
            setToPickerDate(coercedDate);
            dispatch(
              setGraphEndMillisActInc(
                getUnixTimeMillisUtil(
                  systemReprToTsActualUtil(
                    coercedDate,
                    DEFAULT_TARGET_TIME_ZONE
                  )
                )
              )
            );
            return;
          }
        }
        setToPickerDate(newDateSys); // UI turns red if invalid and non-empty
      }}
      value={toPickerDate}
      renderInput={(params) => (
        <TextField
          fullWidth={fullWidth}
          helperText={generateDatePickerHelperTextUtil(toPickerDate)}
          // helperText={generateDatePickerHelperTextUtilDebug(
          //   toPickerDate,
          //   graphEndMillisActInc,
          //   DEFAULT_TARGET_TIME_ZONE
          // )}
          {...params}
        />
      )}
    />
  );
  const radioGroup = (
    <FormGroup sx={{ marginTop: (theme) => theme.spacing(1) }}>
      <FormControlLabel
        sx={{ alignSelf: "center" }}
        control={
          <Switch
            checked={graphShowInterpolation}
            onChange={(event) =>
              dispatch(setGraphShowInterpolation(event.target.checked))
            }
          />
        }
        label="Show interpolation"
      />
    </FormGroup>
  );

  return (
    <>
      <Box
        sx={{
          paddingTop: (theme) => theme.spacing(1),
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "start",
          gap: (theme) => theme.spacing(2),
        }}
      >
        {fromPicker(false)}
        {toPicker(false)}
        {radioGroup}
      </Box>
      <Box
        sx={{
          paddingTop: (theme) => theme.spacing(1),
          display: { xs: "flex", md: "none" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          // gap: (theme) => theme.spacing(2),
        }}
      >
        <Grid2 container columnSpacing={1}>
          <Grid2 xs={6}>{fromPicker(true)}</Grid2>
          <Grid2 xs={6}>{toPicker(true)}</Grid2>
          <Grid2 xs={12}>{radioGroup}</Grid2>
        </Grid2>
      </Box>
    </>
  );
};
