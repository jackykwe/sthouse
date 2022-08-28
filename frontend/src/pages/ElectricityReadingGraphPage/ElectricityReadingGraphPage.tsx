import { useTheme } from "@mui/material";
import _ from "lodash";
import { PageError } from "pages/PageError/PageError";
import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_TARGET_TIME_ZONE,
  fromUnixTimeMillisUtil,
  getStartOfMonthTsFromTsUtil,
  tsActualToSystemReprUtil,
} from "utils/dateUtils";
import { ElectricityReadingGraph } from "./ElectricityReadingGraph";
import { ElectricityReadingGraphHeader } from "./ElectricityReadingGraphHeader";
import {
  useElectricityReadingClientSlice,
  useElectricityReadingServerSlice,
} from "./store";

export const ElectricityReadingGraphPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Client redux state selectors
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
  const graphShowBestFit = useSelector(selectGraphShowBestFit);

  // Client redux state derived
  const [fromPickerDate, setFromPickerDate] = useState<Date | null>(
    graphStartUnixTsMillisActInc === null
      ? null
      : tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartUnixTsMillisActInc),
          DEFAULT_TARGET_TIME_ZONE
        )
  ); // already -7h TS
  const [toPickerDate, setToPickerDate] = useState<Date | null>(
    tsActualToSystemReprUtil(
      fromUnixTimeMillisUtil(graphEndUnixTsMillisActInc),
      DEFAULT_TARGET_TIME_ZONE
    )
  ); // already -7h TS

  // Server redux state selectors
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
  const electricityReadingListLoading = useSelector(
    selectGetElectricityReadingListLoading
  );
  const electricityReadingListData = useSelector(
    selectGetElectricityReadingListData
  );
  const electricityReadingListError = useSelector(
    selectGetElectricityReadingListError
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
      electricityReadingListData !== null &&
      graphStartUnixTsMillisActInc === null
    ) {
      if (electricityReadingListData.length === 0) {
        console.log(
          "elecListData changed (not null) AND sts is null : setting sts to startOfMonth(ets)"
        );
        dispatch(
          setGraphStartUnixTsMillisActInc(
            getStartOfMonthTsFromTsUtil(
              graphEndUnixTsMillisActInc,
              DEFAULT_TARGET_TIME_ZONE
            )
          )
        );
      } else {
        console.log(
          "elecListData changed (not null) AND sts is null: setting sts to startOfMonth(elecListdata[0])"
        );
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
    // debouncedGetElectricityReadingList();
    // // return () => {
    // //   dispatch(resetElectricityReadingListData()); // to fix graph animation issue
    // // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electricityReadingListData]);

  useEffect(() => {
    if (fromPickerDate === null && graphStartUnixTsMillisActInc !== null) {
      console.log(
        "sts changed (not null) AND fromPickerDate is null: setting picker date to startOfMonth(sts)"
      );
      setFromPickerDate(
        tsActualToSystemReprUtil(
          fromUnixTimeMillisUtil(graphStartUnixTsMillisActInc),
          DEFAULT_TARGET_TIME_ZONE
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

  if (electricityReadingListData === null) {
    if (electricityReadingListError !== null) {
      return (
        <PageError
          errorMessage={electricityReadingListError.requestErrorDescription}
        />
      );
    } else if (electricityReadingListLoading) {
      return <PageLoading />;
    }
    return <>WTF</>;
  }

  return (
    <>
      <ElectricityReadingGraphHeader
        dispatch={dispatch}
        fromPickerDate={fromPickerDate}
        setFromPickerDate={setFromPickerDate}
        toPickerDate={toPickerDate}
        setToPickerDate={setToPickerDate}
        graphStartUnixTsMillisActInc={graphStartUnixTsMillisActInc}
        setGraphStartUnixTsMillisActInc={setGraphStartUnixTsMillisActInc}
        graphEndUnixTsMillisActInc={graphEndUnixTsMillisActInc}
        setGraphEndUnixTsMillisActInc={setGraphEndUnixTsMillisActInc}
        graphShowBestFit={graphShowBestFit}
        setGraphShowBestFit={setGraphShowBestFit}
      />
      {electricityReadingListData ? (
        <ElectricityReadingGraph
          electricityReadingListData={electricityReadingListData}
          graphShowBestFit={graphShowBestFit}
          theme={theme}
        />
      ) : electricityReadingListError ? (
        <PageError
          errorMessage={electricityReadingListError.requestErrorDescription}
        />
      ) : electricityReadingListData === null ? (
        <PageLoading />
      ) : (
        <PageError errorMessage="ERROR PLEASE REPORT THIS BUG (bug ID: 3)" />
      )}
      YARR
    </>
  );
};

export default ElectricityReadingGraphPage;
