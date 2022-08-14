import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ElectricityReadingReadDTO } from "services/electricity_readings/types";

const data: ElectricityReadingReadDTO[] = [
  {
    id: 501,
    low_kwh: 44444.44,
    normal_kwh: 88888.88,
    unix_ts_millis: 1660457351088,
    creator_name: "Alice",
  },
  {
    id: 502,
    low_kwh: 45000.0,
    normal_kwh: 89999.99,
    unix_ts_millis: 1660458351178,
    creator_name: "Bob",
  },
  {
    id: 504,
    low_kwh: 48000.12,
    normal_kwh: 90000.0,
    unix_ts_millis: 1660459351290,
    creator_name: "Alice",
  },
  {
    id: 506,
    low_kwh: 49175.34,
    normal_kwh: 91234.56,
    unix_ts_millis: 1660460351573,
    creator_name: "Bob",
  },
  {
    id: 509,
    low_kwh: 52952.12,
    normal_kwh: 98321.76,
    unix_ts_millis: 1660461351405,
    creator_name: "Alice",
  },
  {
    id: 510,
    low_kwh: 55091.98,
    normal_kwh: 100349.18,
    unix_ts_millis: 1660462351636,
    creator_name: "Bob",
  },
  {
    id: 511,
    low_kwh: 56012.11,
    normal_kwh: 104834.77,
    unix_ts_millis: 1660463351777,
    creator_name: "Alice",
  },
  {
    id: 512,
    low_kwh: 72009.12,
    normal_kwh: 105923.34,
    unix_ts_millis: 1660464351810,
    creator_name: "Bob",
  },
  {
    id: 513,
    low_kwh: 78193.33,
    normal_kwh: 106192.04,
    unix_ts_millis: 1660465351928,
    creator_name: "Alice",
  },
  {
    id: 514,
    low_kwh: 79102.99,
    normal_kwh: 108080.8,
    unix_ts_millis: 1660466351999,
    creator_name: "Bob",
  },
];

export const ElectricityReadingGraphPage = () => {
  return (
    <>
      Hi what the fuck
      <ResponsiveContainer>
        <LineChart width={400} height={400} data={data}>
          <Line type="monotone" dataKey="low_kwh" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
      Yarr
    </>
  );
};
