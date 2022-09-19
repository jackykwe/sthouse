import { lazy } from "react";

export const ExportHistoricalPageLazy = lazy(
  () => import("./ExportHistoricalPage")
);
