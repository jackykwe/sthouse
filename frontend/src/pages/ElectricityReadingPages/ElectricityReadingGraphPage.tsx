import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  axiosGetAllElectricityReadings,
  ElectricityReadingReadGraphDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import {
  DEFAULT_TARGET_TIME_ZONE,
  getStartOfMonthTsFromTsUtil,
} from "utils/dateUtils";
import { ElectricityReadingGraph } from "./ElectricityReadingGraph";
import { ElectricityReadingGraphHeader } from "./ElectricityReadingGraphHeader";
import { useElectricityReadingClientSlice } from "./store";

export const ElectricityReadingGraphPage = () => {
  const dispatch = useDispatch();

  // Client redux state selectors
  const {
    actions: { setGraphStartUnixTsMillisActInc, setGraphAbsorbCount },
    selectors: {
      selectGraphStartUnixTsMillisActInc,
      selectGraphEndUnixTsMillisActInc,
      selectGraphAbsorbCount,
    },
  } = useElectricityReadingClientSlice();
  const graphStartUnixTsMillisActInc = useSelector(
    selectGraphStartUnixTsMillisActInc
  );
  const graphEndUnixTsMillisActInc = useSelector(
    selectGraphEndUnixTsMillisActInc
  );
  const graphAbsorbCount = useSelector(selectGraphAbsorbCount);

  const [electricityReadingsLoading, setElectricityReadingsLoading] =
    useState(false);
  const [electricityReadingsData, setElectricityReadingsData] = useState<
    ElectricityReadingReadGraphDTO[] | null
  >(null);
  const [electricityReadingsError, setElectricityReadingsError] = useState<
    string | null
  >(null);

  const getElectricityReadings = async (
    startUnixTsMillisInc: number | undefined,
    endUnixTsMillisInc: number | undefined
  ) => {
    setElectricityReadingsLoading(true);
    setElectricityReadingsError(null);
    const responseData = await axiosGetAllElectricityReadings(
      startUnixTsMillisInc,
      endUnixTsMillisInc
    );
    if (isRequestError(responseData)) {
      setElectricityReadingsError(responseData.requestErrorDescription);
    } else {
      setElectricityReadingsData(responseData);
    }
    setElectricityReadingsLoading(false);
  };

  // Debounced HTTP request-making functions
  const debouncedGetElectricityReadings = _.debounce(
    getElectricityReadings,
    300
  );

  // Use Effects
  useEffect(() => {
    // When the page is loaded (very first load or further reloads)
    // console.log(
    //   "sts or ets changed (RE-RENDER): GET REQUEST list with",
    //   graphStartUnixTsMillisActInc ?? undefined,
    //   graphEndUnixTsMillisActInc
    // );
    debouncedGetElectricityReadings(
      graphStartUnixTsMillisActInc ?? undefined, // on very first run, will be undefined
      graphEndUnixTsMillisActInc
    );
    return () => {
      dispatch(setGraphAbsorbCount(1));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When fresh data has been fetched from the backend for the very first load
  useEffect(() => {
    if (
      electricityReadingsData !== null &&
      graphStartUnixTsMillisActInc === null
    ) {
      if (electricityReadingsData.length === 0) {
        // console.log(
        //   "elecListData changed (not null) AND sts is null : setting sts to startOfMonth(ets)"
        // );
        dispatch(
          setGraphStartUnixTsMillisActInc(
            getStartOfMonthTsFromTsUtil(
              graphEndUnixTsMillisActInc,
              DEFAULT_TARGET_TIME_ZONE
            )
          )
        );
      } else {
        // console.log(
        //   "elecListData changed (not null) AND sts is null: setting sts to startOfMonth(elecListdata[0])"
        // );
        dispatch(
          setGraphStartUnixTsMillisActInc(
            getStartOfMonthTsFromTsUtil(
              electricityReadingsData[0].unix_ts_millis,
              DEFAULT_TARGET_TIME_ZONE
            )
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electricityReadingsData]);

  // console.log(`graphAbsorbCount is now ${graphAbsorbCount}`);
  useEffect(() => {
    // console.log("STS/ETS DEP USEEFFECT RAN...");
    // 2 absorb counts:
    // one to absorb when this useEffect() runs no matter what, and
    // one to absorb when graphStartUnixTsMillisActInc is changed after first insert
    if (graphAbsorbCount > 0) {
      // console.log(
      //   `sts or ets changed: graphAbsorbCount is decremented to ${
      //     graphAbsorbCount - 1
      //   }`
      // );
      dispatch(setGraphAbsorbCount(graphAbsorbCount - 1));
    } else {
      // console.log(
      //   `sts or ets changed: graphAbsorbCount is still ${graphAbsorbCount}, GET REQUEST list with ${graphStartUnixTsMillisActInc} ${graphEndUnixTsMillisActInc}`
      // );
      debouncedGetElectricityReadings(
        graphStartUnixTsMillisActInc!,
        graphEndUnixTsMillisActInc
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphStartUnixTsMillisActInc, graphEndUnixTsMillisActInc]);

  return (
    <>
      <ElectricityReadingGraphHeader
        hasData={electricityReadingsData !== null}
        hasError={electricityReadingsError !== null}
      />
      <ElectricityReadingGraph
        electricityReadingsLoading={electricityReadingsLoading}
        electricityReadingsData={electricityReadingsData}
        electricityReadingsError={electricityReadingsError}
      />
    </>
  );
};

export default ElectricityReadingGraphPage;
