import { useTheme } from "@mui/material";
import { blue, grey, red } from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Box from "@mui/system/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { addMilliseconds, endOfMonth, isValid, startOfMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import _ from "lodash";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AxisDomain } from "recharts/types/util/types";
import { ElectricityReadingReadGraphDTO } from "services/electricity_readings";
import {
  DATE_PICKER_MAX_DATE,
  DATE_PICKER_MIN_DATE,
  fromUnixTimeMillisUtil,
  generateDatePickerHelperTextUtil,
  getStartOfMonthTsFromTs,
  getUnixTimeMillisUtil,
  isWithinAllowedIntervalUtil,
  systemReprToTsActualUtil,
  tsActualToSystemReprUtil,
} from "utils/dateUtils";
import {
  useElectricityReadingClientSlice,
  useElectricityReadingServerSlice,
} from "./store";

export const ElectricityReadingGraphPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [armed, setArmed] = useState(false);

  const {
    actions: {
      setGraphStartUnixTsMillisActInc,
      setGraphEndUnixTsMillisActInc,
      setGraphAbsorbCount,
      setGraphShowBestFit,
      resetGraphStartEndUnixTsMillisActInc,
    },
    selectors: {
      selectGraphStartUnixTsMillisActInc,
      selectGraphEndUnixTsMillisActInc,
      selectGraphAbsorbCount,
      selectGraphShowBestFit,
    },
  } = useElectricityReadingClientSlice();
  const graphStartUnixTsMillisActInc = useSelector(
    selectGraphStartUnixTsMillisActInc
  );
  const graphEndUnixTsMillisActInc = useSelector(
    selectGraphEndUnixTsMillisActInc
  );
  const graphAbsorbCount = useSelector(selectGraphAbsorbCount);
  const [fromPickerDate, setFromPickerDate] = useState<Date | null>(
    graphStartUnixTsMillisActInc === null
      ? null
      : tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartUnixTsMillisActInc),
          "Europe/London"
        )
  ); // already -7h TS
  const [toPickerDate, setToPickerDate] = useState<Date | null>(
    tsActualToSystemReprUtil(
      fromUnixTimeMillisUtil(graphEndUnixTsMillisActInc),
      "Europe/London"
    )
  ); // already -7h TS
  const graphShowBestFit = useSelector(selectGraphShowBestFit);

  const {
    actions: {
      resetElectricityReadingListData,
      getElectricityReadingListRequest,
    },
    selectors: {
      selectGetElectricityReadingListLoading,
      selectGetElectricityReadingListData,
      selectGetElectricityReadingListError,
    },
  } = useElectricityReadingServerSlice();
  const electricityReadingLoading = useSelector(
    selectGetElectricityReadingListLoading
  );
  const electricityReadingList = useSelector(
    selectGetElectricityReadingListData
  );
  const electricityReadingError = useSelector(
    selectGetElectricityReadingListError
  );

  const debouncedGetElectricityReadingList = _.debounce(
    (
      startUnixTsMillisInc: number | undefined,
      endUnixTsMillisInc: number | undefined
    ) => {
      dispatch(
        getElectricityReadingListRequest({
          startUnixTsMillisInc,
          endUnixTsMillisInc,
        })
      );
    },
    300
  );

  // When the page is loaded (very first load or further reloads)
  useEffect(() => {
    console.log(
      "sts or ets changed (RE-RENDER): GET REQUEST list with",
      graphStartUnixTsMillisActInc ?? undefined,
      graphEndUnixTsMillisActInc
    );
    debouncedGetElectricityReadingList(
      graphStartUnixTsMillisActInc ?? undefined, // on very first run, will be undefined
      graphEndUnixTsMillisActInc
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When fresh data has been fetched from the backend for the very first load
  useEffect(() => {
    if (
      electricityReadingList !== null &&
      graphStartUnixTsMillisActInc === null
    ) {
      if (electricityReadingList.length === 0) {
        console.log(
          "elecListData changed (not null) AND sts is null : setting sts to startOfMonth(ets)"
        );
        dispatch(
          setGraphStartUnixTsMillisActInc(
            getStartOfMonthTsFromTs(graphEndUnixTsMillisActInc, "Europe/London")
          )
        );
      } else {
        console.log(
          "elecListData changed (not null) AND sts is null: setting sts to startOfMonth(elecListdata[0])"
        );
        dispatch(
          setGraphStartUnixTsMillisActInc(
            getStartOfMonthTsFromTs(
              electricityReadingList[0].unix_ts_millis,
              "Europe/London"
            )
          )
        );
      }
    }
    // debouncedGetElectricityReadingList();
    // // return () => {
    // //   dispatch(resetElectricityReadingListData()); // to fix graph animation issue
    // // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electricityReadingList]);

  useEffect(() => {
    if (fromPickerDate === null && graphStartUnixTsMillisActInc !== null) {
      console.log(
        "sts changed (not null) AND fromPickerDate is null: setting picker date to startOfMonth(sts)"
      );
      setFromPickerDate(
        tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartUnixTsMillisActInc),
          "Europe/London"
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphStartUnixTsMillisActInc]);

  console.log(`graphAbsorbCount is now ${graphAbsorbCount}`);
  useEffect(() => {
    if (graphAbsorbCount > 0) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      console.log(
        `sts or ets changed: graphAbsorbCount is decremented to ${
          graphAbsorbCount - 1
        }`
      );
      dispatch(setGraphAbsorbCount(graphAbsorbCount - 1));
    } else {
      console.log(
        `sts or ets changed: graphAbsorbCount is still ${graphAbsorbCount}, GET REQUEST list with ${graphStartUnixTsMillisActInc} ${graphEndUnixTsMillisActInc}`
      );
      dispatch(
        getElectricityReadingListRequest({
          startUnixTsMillisInc: graphStartUnixTsMillisActInc!,
          endUnixTsMillisInc: graphEndUnixTsMillisActInc,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphStartUnixTsMillisActInc, graphEndUnixTsMillisActInc]);

  if (electricityReadingList === null) {
    if (electricityReadingError !== null) {
      return (
        <PageError
          errorMessage={electricityReadingError.requestErrorDescription}
        />
      );
    } else if (electricityReadingLoading) {
      return <PageLoading />;
    }
    return <>WTF</>;
  }

  // y-axis domain calculations
  let lowDomain: AxisDomain = ["auto", "auto"];
  let normalDomain: AxisDomain = ["auto", "auto"];
  let dateDomain: AxisDomain = ["auto", "auto"];
  if (electricityReadingList !== null && electricityReadingList.length >= 2) {
    const minLow = electricityReadingList
      .map((dto) => dto.low_kwh)
      .reduce(
        (prevMin, val) => Math.min(prevMin, val),
        Number.MAX_SAFE_INTEGER
      );
    const maxLow = electricityReadingList
      .map((dto) => dto.low_kwh)
      .reduce(
        (prevMax, val) => Math.max(prevMax, val),
        Number.MIN_SAFE_INTEGER
      );
    const minNormal = electricityReadingList
      .map((dto) => dto.normal_kwh)
      .reduce(
        (prevMin, val) => Math.min(prevMin, val),
        Number.MAX_SAFE_INTEGER
      );
    const maxNormal = electricityReadingList
      .map((dto) => dto.normal_kwh)
      .reduce(
        (prevMax, val) => Math.max(prevMax, val),
        Number.MIN_SAFE_INTEGER
      );
    const maxDiff = Math.max(maxLow - minLow, maxNormal - minNormal);
    lowDomain = [minLow, minLow + maxDiff];
    normalDomain = [minNormal, minNormal + maxDiff];

    const minDate = fromUnixTimeMillisUtil(
      electricityReadingList[0].unix_ts_millis
    );
    const maxDate = fromUnixTimeMillisUtil(
      electricityReadingList[electricityReadingList.length - 1].unix_ts_millis
    );
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);
  }

  // Best fit calculations
  let electricityReadingListAugmented:
    | (
        | ElectricityReadingReadGraphDTO
        | { low_kwh_best_fit: number; normal_kwh_best_fit: number }
      )[]
    | null = null;
  let lowBestFitLabel = "Low";
  let normalBestFitLabel = "Normal";
  if (electricityReadingList !== null && electricityReadingList.length >= 2) {
    const firstMillis = electricityReadingList[0].unix_ts_millis;
    const firstLow = electricityReadingList[0].low_kwh;
    const firstNormal = electricityReadingList[0].normal_kwh;
    const lastMillis =
      electricityReadingList[electricityReadingList.length - 1].unix_ts_millis;
    const lastLow =
      electricityReadingList[electricityReadingList.length - 1].low_kwh;
    const lastNormal =
      electricityReadingList[electricityReadingList.length - 1].normal_kwh;
    const millisDiff = lastMillis - firstMillis;
    const daysDiff = millisDiff / 86_400_000; // 1000 * 60 * 60 * 24
    const lowDiff = lastLow - firstLow;
    const normalDiff = lastNormal - firstNormal;
    const lowSign = lowDiff < 0 ? "-" : "+";
    const normalSign = normalDiff < 0 ? "-" : "+";

    const lowRate = `${lowSign}${(lowDiff / daysDiff).toFixed(2)}`;
    const normalRate = `${normalSign}${(normalDiff / daysDiff).toFixed(2)}`;
    electricityReadingListAugmented = (
      electricityReadingList as (
        | ElectricityReadingReadGraphDTO
        | {
            unix_ts_millis: number;
            low_kwh_best_fit: number;
            normal_kwh_best_fit: number;
          }
      )[]
    ).concat([
      {
        unix_ts_millis: firstMillis,
        low_kwh_best_fit: firstLow,
        normal_kwh_best_fit: firstNormal,
      },
      {
        unix_ts_millis: lastMillis,
        low_kwh_best_fit: lastLow,
        normal_kwh_best_fit: lastNormal,
      },
    ]);
    lowBestFitLabel = `Low (in this date range, average ${lowRate} kWh/day)`;
    normalBestFitLabel = `Normal (in this date range, average ${normalRate} kWh/day)`;
  } else {
    electricityReadingListAugmented = electricityReadingList;
  }

  const normalRed = theme.palette.mode === "light" ? red[700] : red[300];
  const lowBlue = theme.palette.mode === "light" ? blue[700] : blue[400];
  const xAxisColour = theme.palette.mode === "light" ? grey[900] : grey[500];
  const xyGridColour = theme.palette.mode === "light" ? grey[300] : grey[800];
  return (
    <>
      YARRR
      <Box sx={{ display: "flex" }}>
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
                      systemReprToTsActualUtil(coercedDate, "Europe/London")
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
                      systemReprToTsActualUtil(coercedDate, "Europe/London")
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
      {electricityReadingListAugmented ? (
        <ResponsiveContainer>
          <LineChart
            data={electricityReadingListAugmented ?? undefined}
            margin={{ top: 20, bottom: 20, left: 60, right: 60 }}
          >
            <YAxis
              dataKey="low_kwh"
              yAxisId="left"
              orientation="left"
              tickCount={10} // doesn't really behave...
              domain={lowDomain}
              interval="preserveStartEnd"
              padding={{ top: 10, bottom: 10 }}
              allowDecimals={false}
              stroke={lowBlue}
              tickLine={{ stroke: lowBlue }}
              tick={{
                fill: lowBlue,
              }}
              label={{
                value: "Low (Cheaper Electricity) (kWh)",
                angle: -90,
                position: "center",
                dx: -60,
                fill: lowBlue,
              }}
              scale="linear"
              tickMargin={8}
            />
            <YAxis
              dataKey="normal_kwh"
              yAxisId="right"
              orientation="right"
              tickCount={10} // doesn't really behave...
              domain={normalDomain}
              interval="preserveStartEnd"
              padding={{ top: 10, bottom: 10 }}
              allowDecimals={false}
              stroke={normalRed}
              tickLine={{ stroke: normalRed }}
              tick={{
                fill: normalRed,
              }}
              label={{
                value: "Normal (Expensive Electricity) (kWh)",
                angle: 90,
                position: "center",
                dx: 60,
                fill: normalRed,
              }}
              scale="linear"
              tickMargin={8}
            />
            <XAxis
              dataKey="unix_ts_millis"
              type="number"
              allowDecimals={false}
              // angle={45}
              tickCount={10}
              domain={dateDomain}
              interval="preserveStartEnd"
              stroke={xAxisColour}
              tickLine={{ stroke: xAxisColour }}
              tickFormatter={(unix_ts_millis) =>
                formatInTimeZone(
                  fromUnixTimeMillisUtil(unix_ts_millis),
                  // timestamp saved into DB is unambiguous; this forces frontend to render
                  // that timestamp as a Date in GMT/BST
                  "Europe/London",
                  "d MMM yyyy"
                )
              }
              tick={{
                fill: xAxisColour,
                // stroke: theme.palette.background.paper,
                // strokeWidth: 2
              }}
            />
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              formatter={(value: string) =>
                value === "low_kwh"
                  ? lowBestFitLabel
                  : value === "normal_kwh"
                  ? normalBestFitLabel
                  : "ERROR"
              }
            />
            <Tooltip
              contentStyle={{ background: theme.palette.background.paper }}
              separator=": "
              cursor={{ stroke: xyGridColour, strokeWidth: 2 }}
              labelFormatter={(unix_ts_millis) =>
                formatInTimeZone(
                  fromUnixTimeMillisUtil(unix_ts_millis),
                  // timestamp saved into DB is unambiguous; this forces frontend to render
                  // that timestamp as a Date in GMT/BST
                  "Europe/London",
                  "HH':'mm':'ss eee d MMM yyyy (O)"
                )
              }
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)} kWh`,
                name === "low_kwh"
                  ? "Low"
                  : name === "normal_kwh"
                  ? "Normal"
                  : "ERROR",
              ]}
            />
            <Line
              type="monotone"
              dataKey="low_kwh"
              yAxisId="left"
              dot={{ fill: lowBlue, stroke: lowBlue, strokeWidth: 2 }}
              activeDot={{
                fill: theme.palette.background.paper,
                stroke: lowBlue,
                strokeWidth: 4,
                r: 12,
                onClick: () => console.log("helppppp"),
                cursor: "pointer",
              }}
              stroke={lowBlue}
              strokeWidth={2}
              animationBegin={graphShowBestFit ? 500 : 0}
              animationDuration={500}
              animationEasing="ease"
            />
            <Line
              type="monotone"
              dataKey="normal_kwh"
              yAxisId="right"
              dot={{ fill: normalRed, stroke: normalRed, strokeWidth: 2 }}
              activeDot={{
                fill: theme.palette.background.paper,
                stroke: normalRed,
                strokeWidth: 4,
                r: 12,
                onClick: () => console.log("helppppp"),
                cursor: "pointer",
              }}
              stroke={normalRed}
              strokeWidth={2}
              animationBegin={graphShowBestFit ? 500 : 0}
              animationDuration={500}
              animationEasing="ease"
            />
            {graphShowBestFit ? (
              <Line
                type="linear"
                dataKey="low_kwh_best_fit"
                yAxisId="left"
                legendType="none"
                dot={false}
                activeDot={false}
                stroke={lowBlue}
                strokeWidth={1}
                animationDuration={500}
                animationEasing="ease"
                strokeDasharray="25 10"
              />
            ) : null}
            {graphShowBestFit ? (
              <Line
                type="linear"
                dataKey="normal_kwh_best_fit"
                yAxisId="right"
                legendType="none"
                dot={false}
                activeDot={false}
                stroke={normalRed}
                strokeWidth={1}
                animationDuration={500}
                animationEasing="ease"
                strokeDasharray="5 5"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      ) : electricityReadingError ? (
        <PageError
          errorMessage={electricityReadingError.requestErrorDescription}
        />
      ) : electricityReadingList === null ? (
        <PageLoading />
      ) : (
        <PageError errorMessage="UNIDENTIFIED ERROR IS THIS POSSIBLE?" />
      )}
    </>
  );
};

export default ElectricityReadingGraphPage;
