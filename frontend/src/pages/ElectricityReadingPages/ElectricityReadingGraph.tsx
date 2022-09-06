import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import blue from "@mui/material/colors/blue";
import grey from "@mui/material/colors/grey";
import red from "@mui/material/colors/red";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/system";
import { formatInTimeZone } from "date-fns-tz";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { generateElectricityDetailPath } from "routes/RouteEnum";
import { ElectricityReadingReadGraphDTO } from "services/electricity_readings";
import {
  DEFAULT_TARGET_TIME_ZONE,
  fromUnixTimeMillisUtil,
} from "utils/dateUtils";
import {
  useElectricityReadingClientSlice,
  useElectricityReadingServerSlice,
} from "./store";

interface GraphAxisDomains {
  lowDomain: AxisDomain;
  normalDomain: AxisDomain;
}

/**
 * @param electricityReadingListData Assumed to have length >= 1
 */
const calculateGraphAxisDomains = (
  electricityReadingListData: ElectricityReadingReadGraphDTO[]
) => {
  if (electricityReadingListData.length === 1) {
    return {
      lowDomain: ["auto", "auto"],
      normalDomain: ["auto", "auto"],
    } as GraphAxisDomains;
  }

  const minLow = electricityReadingListData
    .map((dto) => dto.low_kwh)
    .reduce((prevMin, val) => Math.min(prevMin, val), Number.MAX_SAFE_INTEGER);
  const minNormal = electricityReadingListData
    .map((dto) => dto.normal_kwh)
    .reduce((prevMin, val) => Math.min(prevMin, val), Number.MAX_SAFE_INTEGER);

  const maxLow = electricityReadingListData
    .map((dto) => dto.low_kwh)
    .reduce((prevMax, val) => Math.max(prevMax, val), Number.MIN_SAFE_INTEGER);
  const maxNormal = electricityReadingListData
    .map((dto) => dto.normal_kwh)
    .reduce((prevMax, val) => Math.max(prevMax, val), Number.MIN_SAFE_INTEGER);

  const maxDiff = Math.max(maxLow - minLow, maxNormal - minNormal);

  return {
    lowDomain: [minLow, minLow + maxDiff],
    normalDomain: [minNormal, minNormal + maxDiff],
  } as GraphAxisDomains;
};

type GraphDataAndLegendLabels = {
  data: (
    | ElectricityReadingReadGraphDTO
    | {
        unix_ts_millis: number;
        low_kwh_best_fit: number;
        normal_kwh_best_fit: number;
      }
  )[];
  lowBestFitLabel: string;
  normalBestFitLabel: string;
};

/**
 * Includes best fit line calculations
 * @param electricityReadingListData Assumed to have length >= 1
 */
const calculateGraphDataAndLegendLabels = (
  electricityReadingListData: ElectricityReadingReadGraphDTO[]
) => {
  if (electricityReadingListData.length === 1) {
    return {
      data: electricityReadingListData,
      lowBestFitLabel: "Low",
      normalBestFitLabel: "Normal",
    } as GraphDataAndLegendLabels;
  }

  const firstMillis = electricityReadingListData[0].unix_ts_millis;
  const lastMillis =
    electricityReadingListData[electricityReadingListData.length - 1]
      .unix_ts_millis;
  const millisDiff = lastMillis - firstMillis;
  const daysDiff = millisDiff / 86_400_000; // 1000 * 60 * 60 * 24

  const firstLow = electricityReadingListData[0].low_kwh;
  const firstNormal = electricityReadingListData[0].normal_kwh;
  const lastLow =
    electricityReadingListData[electricityReadingListData.length - 1].low_kwh;
  const lastNormal =
    electricityReadingListData[electricityReadingListData.length - 1]
      .normal_kwh;

  const lowDiff = lastLow - firstLow;
  const lowSign = lowDiff < 0 ? "-" : "+";
  const normalDiff = lastNormal - firstNormal;
  const normalSign = normalDiff < 0 ? "-" : "+";

  const lowRate = `${lowSign}${(lowDiff / daysDiff).toFixed(2)}`;
  const normalRate = `${normalSign}${(normalDiff / daysDiff).toFixed(2)}`;

  return {
    data: (
      [
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
      ] as GraphDataAndLegendLabels["data"]
    ).concat(electricityReadingListData),
    lowBestFitLabel: `Low (in this date range, average ${lowRate} kWh/day)`,
    normalBestFitLabel: `Normal (in this date range, average ${normalRate} kWh/day)`,
  } as GraphDataAndLegendLabels;
};

interface GraphColours {
  normalRed: string;
  lowBlue: string;
  xAxisColour: string;
  xyGridColour: string;
}

const calculateGraphColours = (theme: Theme) => {
  return {
    normalRed: theme.palette.mode === "light" ? red[700] : red[300],
    lowBlue: theme.palette.mode === "light" ? blue[700] : blue[400],
    xAxisColour: theme.palette.mode === "light" ? grey[900] : grey[500],
    xyGridColour: theme.palette.mode === "light" ? grey[300] : grey[800],
  } as GraphColours;
};

interface ElectricityReadingGraphProps {
  // electricityReadingListData: ElectricityReadingReadGraphDTO[];
  // graphShowBestFit: boolean;
  // theme: Theme;
}

export const ElectricityReadingGraph = (
  props: ElectricityReadingGraphProps
) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Client redux state selectors
  const {
    selectors: {
      selectGraphShowBestFit,
      selectGraphStartUnixTsMillisActInc,
      selectGraphEndUnixTsMillisActInc,
    },
  } = useElectricityReadingClientSlice();
  const graphShowBestFit = useSelector(selectGraphShowBestFit);
  const graphStartUnixTsMillisActInc = useSelector(
    selectGraphStartUnixTsMillisActInc
  );
  const graphEndUnixTsMillisActInc = useSelector(
    selectGraphEndUnixTsMillisActInc
  );

  // Server redux state selectors
  const {
    selectors: {
      selectGetElectricityReadingListLoading,
      selectGetElectricityReadingListData,
      selectGetElectricityReadingListError,
    },
  } = useElectricityReadingServerSlice();
  const electricityReadingListLoading = useSelector(
    selectGetElectricityReadingListLoading
  );
  const electricityReadingListData = useSelector(
    selectGetElectricityReadingListData
  );
  const electricityReadingListError = useSelector(
    selectGetElectricityReadingListError
  );

  if (electricityReadingListLoading || electricityReadingListData === null) {
    return <PageLoading />;
  }
  if (electricityReadingListError !== null) {
    return (
      <PageError
        errorMessage={electricityReadingListError.requestErrorDescription}
      />
    );
  }

  if (electricityReadingListData.length === 0) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InfoOutlinedIcon
          sx={{ fontSize: 60, paddingBottom: (theme) => theme.spacing(1) }}
        />
        <Typography variant="h5">
          No records to display within this time period
        </Typography>
      </Box>
    );
  }

  const { lowDomain, normalDomain } = calculateGraphAxisDomains(
    electricityReadingListData
  );
  const { data, lowBestFitLabel, normalBestFitLabel } =
    calculateGraphDataAndLegendLabels(electricityReadingListData);
  const { normalRed, lowBlue, xAxisColour, xyGridColour } =
    calculateGraphColours(theme);

  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
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
          domain={[graphStartUnixTsMillisActInc!, graphEndUnixTsMillisActInc]}
          interval="preserveStartEnd"
          stroke={xAxisColour}
          tickLine={{ stroke: xAxisColour }}
          tickFormatter={(unix_ts_millis) =>
            formatInTimeZone(
              fromUnixTimeMillisUtil(unix_ts_millis),
              // timestamp saved into DB is unambiguous; this forces frontend to render
              // that timestamp as a Date in GMT/BST
              DEFAULT_TARGET_TIME_ZONE,
              "d MMM yyyy"
            )
          }
          tick={{ fill: xAxisColour }}
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
              : "ERROR PLEASE REPORT THIS BUG  (bug ID: 1)"
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
              DEFAULT_TARGET_TIME_ZONE,
              "HH':'mm':'ss eee d MMM yyyy (O)"
            )
          }
          formatter={(value: number, name: string) =>
            name === "low_kwh"
              ? [`${value.toFixed(1)} kWh`, "Low"]
              : name === "normal_kwh"
              ? [`${value.toFixed(1)} kWh`, "Normal"]
              : name === "low_kwh_best_fit"
              ? [`${value.toFixed(1)} kWh (Linear interpolation)`, "Low"]
              : name === "normal_kwh_best_fit"
              ? [`${value.toFixed(1)} kWh (Linear interpolation)`, "Normal"]
              : "ERROR PLEASE REPORT THIS BUG"
          }
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
            onClick: (data, index) =>
              navigate(
                generateElectricityDetailPath(
                  // recharts messed up their interface
                  (index as any).payload.id
                )
              ),
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
  );
};
