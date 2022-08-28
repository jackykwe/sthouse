import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers";
import {
  ActionCreatorWithPayload,
  AnyAction,
  Dispatch,
} from "@reduxjs/toolkit";
import { addMilliseconds, endOfMonth, isValid, startOfMonth } from "date-fns";
import {
  DATE_PICKER_MAX_DATE,
  DATE_PICKER_MIN_DATE,
  DEFAULT_TARGET_TIME_ZONE,
  // generateDatePickerHelperTextUtil,
  generateDatePickerHelperTextUtilDebug,
  getUnixTimeMillisUtil,
  isWithinAllowedIntervalUtil,
  systemReprToTsActualUtil,
} from "utils/dateUtils";

interface ElectricityReadingGraphHeaderProps {
  dispatch: Dispatch<AnyAction>;
  fromPickerDate: Date | null;
  setFromPickerDate: React.Dispatch<React.SetStateAction<Date | null>>;
  toPickerDate: Date | null;
  setToPickerDate: React.Dispatch<React.SetStateAction<Date | null>>;
  graphStartUnixTsMillisActInc: number | null;
  setGraphStartUnixTsMillisActInc: ActionCreatorWithPayload<number, string>;
  graphEndUnixTsMillisActInc: number | null;
  setGraphEndUnixTsMillisActInc: ActionCreatorWithPayload<number, string>;
  graphShowBestFit: boolean;
  setGraphShowBestFit: ActionCreatorWithPayload<boolean, string>;
}

export const ElectricityReadingGraphHeader = (
  props: ElectricityReadingGraphHeaderProps
) => {
  const {
    dispatch,
    fromPickerDate,
    setFromPickerDate,
    toPickerDate,
    setToPickerDate,
    graphStartUnixTsMillisActInc,
    setGraphStartUnixTsMillisActInc,
    graphEndUnixTsMillisActInc,
    setGraphEndUnixTsMillisActInc,
    graphShowBestFit,
    setGraphShowBestFit,
  } = props;
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
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
                setGraphStartUnixTsMillisActInc(
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
            // helperText={generateDatePickerHelperTextUtil(fromPickerDate)}
            helperText={generateDatePickerHelperTextUtilDebug(
              fromPickerDate,
              graphStartUnixTsMillisActInc,
              DEFAULT_TARGET_TIME_ZONE
            )}
            {...params}
          />
        )}
      />
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
                setGraphEndUnixTsMillisActInc(
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
            // helperText={generateDatePickerHelperTextUtil(toPickerDate)}
            helperText={generateDatePickerHelperTextUtilDebug(
              toPickerDate,
              graphEndUnixTsMillisActInc,
              DEFAULT_TARGET_TIME_ZONE
            )}
            {...params}
          />
        )}
      />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={graphShowBestFit}
              onChange={(event) =>
                dispatch(setGraphShowBestFit(event.target.checked))
              }
            />
          }
          label="Show best fit"
        />
      </FormGroup>
    </Box>
  );
};
