import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
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
      setGraphShowBestFit,
    },
    selectors: {
      selectGraphStartMillisActInc,
      selectGraphEndMillisActInc,
      selectGraphShowBestFit,
    },
  } = useElectricityReadingClientSlice();
  const graphStartMillisActInc = useSelector(selectGraphStartMillisActInc);
  const graphEndMillisActInc = useSelector(selectGraphEndMillisActInc);
  const graphShowBestFit = useSelector(selectGraphShowBestFit);

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

  return (
    <Box
      sx={{
        paddingTop: (theme) => theme.spacing(1),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: (theme) => theme.spacing(2),
      }}
    >
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
      <FormGroup sx={{ marginBottom: (theme) => theme.spacing(3) }}>
        <FormControlLabel
          control={
            <Switch
              checked={graphShowBestFit}
              onChange={(event) =>
                dispatch(setGraphShowBestFit(event.target.checked))
              }
            />
          }
          label="Show interpolation"
        />
      </FormGroup>
    </Box>
  );
};
