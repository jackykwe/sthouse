import _ from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_TARGET_TIME_ZONE,
  getStartOfMonthTsFromTsUtil,
} from "utils/dateUtils";
import { ElectricityReadingGraph } from "./ElectricityReadingGraph";
import { ElectricityReadingGraphHeader } from "./ElectricityReadingGraphHeader";
import {
  useElectricityReadingClientSlice,
  useElectricityReadingServerSlice,
} from "./store";

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

  // Server redux state selectors
  const {
    actions: {
      resetElectricityReadingListData,
      getElectricityReadingListRequest,
    },
    selectors: { selectGetElectricityReadingListData },
  } = useElectricityReadingServerSlice();
  const electricityReadingListData = useSelector(
    selectGetElectricityReadingListData
  );

  // Debounced HTTP request-making functions
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

  // Use Effects
  useEffect(() => {
    // When the page is loaded (very first load or further reloads)
    // console.log(
    //   "sts or ets changed (RE-RENDER): GET REQUEST list with",
    //   graphStartUnixTsMillisActInc ?? undefined,
    //   graphEndUnixTsMillisActInc
    // );
    debouncedGetElectricityReadingList(
      graphStartUnixTsMillisActInc ?? undefined, // on very first run, will be undefined
      graphEndUnixTsMillisActInc
    );
    return () => {
      dispatch(resetElectricityReadingListData());
      dispatch(setGraphAbsorbCount(1));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When fresh data has been fetched from the backend for the very first load
  useEffect(() => {
    if (
      electricityReadingListData !== null &&
      graphStartUnixTsMillisActInc === null
    ) {
      if (electricityReadingListData.length === 0) {
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
              electricityReadingListData[0].unix_ts_millis,
              DEFAULT_TARGET_TIME_ZONE
            )
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electricityReadingListData]);

  // console.log(`graphAbsorbCount is now ${graphAbsorbCount}`);
  useEffect(() => {
    // console.log("STS/ETS DEP USEEFFECT RAN...");
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

  return (
    <>
      <ElectricityReadingGraphHeader />
      <ElectricityReadingGraph />
    </>
  );
};

export default ElectricityReadingGraphPage;
