import { lazy } from "react";

export const ElectricityReadingGraphPageLazy = lazy(
  () => import("./ElectricityReadingGraphPage")
);
