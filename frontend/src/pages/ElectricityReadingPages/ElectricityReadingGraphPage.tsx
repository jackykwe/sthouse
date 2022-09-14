import { useAuth0 } from "@auth0/auth0-react";
import _ from "lodash";
import { PageError } from "pages/PageError/PageError";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  axiosGetAllElectricityReadings,
  ElectricityReadingReadGraphDTO,
} from "services/electricity_readings";
import { isRequestError } from "types";
import { getStartOfMonthTsFromTsInTzUtil } from "utils/dateUtils";
import { ElectricityReadingGraph } from "./ElectricityReadingGraph";
import { ElectricityReadingGraphHeader } from "./ElectricityReadingGraphHeader";
import { useElectricityReadingClientSlice } from "./store";

export const ElectricityReadingGraphPage = () => {
  // GENERAL HOOKS
  const dispatch = useDispatch();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  // CLIENT REDUX STATE SELECTORS
  const {
    actions: { setGraphStartMillisActInc, setGraphAbsorbCount },
    selectors: {
      selectGraphStartMillisActInc,
      selectGraphEndMillisActInc,
      selectGraphAbsorbCount,
    },
  } = useElectricityReadingClientSlice();
  const graphStartMillisActInc = useSelector(selectGraphStartMillisActInc);
  const graphEndMillisActInc = useSelector(selectGraphEndMillisActInc);
  const graphAbsorbCount = useSelector(selectGraphAbsorbCount);

  // HOOKS FOR FETCHING DATA
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [readingsData, setReadingsData] = useState<
    ElectricityReadingReadGraphDTO[] | null
  >(null);
  const [readingsError, setReadingsError] = useState<string | null>(null);

  const getReadings = async (
    startUnixTsMillisInc: number | undefined,
    endUnixTsMillisInc: number | undefined
  ) => {
    if (!isAuthenticated) return;

    setReadingsLoading(true);
    setReadingsError(null);
    const accessToken = await getAccessTokenSilently();
    const responseData = await axiosGetAllElectricityReadings(
      startUnixTsMillisInc,
      endUnixTsMillisInc,
      accessToken
    );
    if (isRequestError(responseData)) {
      setReadingsError(responseData.requestErrorDescription);
    } else {
      setReadingsData(responseData);
    }
    setReadingsLoading(false);
  };
  const debouncedGetReadings = _.debounce(getReadings, 300);

  // BUSINESS LOGIC: USE EFFECTS GALORE
  useEffect(() => {
    // When the page is loaded (very first load or further reloads)
    // console.log(
    //   "sts or ets changed (RE-RENDER): GET REQUEST list with",
    //   graphStartUnixTsMillisActInc ?? undefined,
    //   graphEndUnixTsMillisActInc
    // );
    debouncedGetReadings(
      graphStartMillisActInc ?? undefined, // on very first run, will be undefined
      graphEndMillisActInc
    );
    return () => {
      dispatch(setGraphAbsorbCount(readingsData === null ? 2 : 1));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When fresh data has been fetched from the backend for the very first load
  useEffect(() => {
    if (readingsData !== null && graphStartMillisActInc === null) {
      if (readingsData.length === 0) {
        // console.log(
        //   "elecListData changed (not null) AND sts is null : setting sts to startOfMonth(ets)"
        // );
        dispatch(
          setGraphStartMillisActInc(
            getStartOfMonthTsFromTsInTzUtil(graphEndMillisActInc)
          )
        );
      } else {
        // console.log(
        //   "elecListData changed (not null) AND sts is null: setting sts to startOfMonth(elecListdata[0])"
        // );
        dispatch(
          setGraphStartMillisActInc(
            getStartOfMonthTsFromTsInTzUtil(readingsData[0].unix_ts_millis)
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingsData]);

  // console.log(`graphAbsorbCount is now ${graphAbsorbCount}`);
  useEffect(() => {
    // console.log("STS/ETS DEP USEEFFECT RAN...");
    // 2 absorb counts:
    // one to absorb when this useEffect() runs no matter what (this one gets reset on navigating away),
    // and one to absorb when graphStartUnixTsMillisActInc is changed after first insert
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
      debouncedGetReadings(graphStartMillisActInc!, graphEndMillisActInc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphStartMillisActInc, graphEndMillisActInc]);

  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  return (
    <>
      <ElectricityReadingGraphHeader
        hasData={readingsData !== null}
        hasError={readingsError !== null}
      />
      <ElectricityReadingGraph
        readingsLoading={readingsLoading}
        readingsData={readingsData}
        readingsError={readingsError}
      />
    </>
  );
};

export default ElectricityReadingGraphPage;
