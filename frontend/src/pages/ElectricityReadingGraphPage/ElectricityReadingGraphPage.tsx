import _ from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useElectricityReadingServerSlice } from "./store";

export const ElectricityReadingGraphPage = () => {
  const dispatch = useDispatch();
  const {
    actions: { getElectricityReadingListRequest },
    selectors: { selectGetElectricityReadingListData },
  } = useElectricityReadingServerSlice();
  const electricityReadingList = useSelector(
    selectGetElectricityReadingListData
  );

  const debouncedGetElectricityReadingList = _.debounce(() => {
    dispatch(getElectricityReadingListRequest());
  }, 300);

  useEffect(() => {
    debouncedGetElectricityReadingList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      Yarr
      <ResponsiveContainer>
        <LineChart data={electricityReadingList ?? undefined}>
          <Line type="monotone" dataKey="low_kwh" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
      Yarr
    </>
  );
};

export default ElectricityReadingGraphPage;
