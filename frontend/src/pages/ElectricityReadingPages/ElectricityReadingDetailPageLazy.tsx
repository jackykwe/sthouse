import { lazy } from "react";

export const ElectricityReadingDetailPageLazy = lazy(
  () => import("./ElectricityReadingDetailPage")
);
