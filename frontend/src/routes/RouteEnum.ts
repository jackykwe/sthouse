import {
  ElectricityReadingCreatePageLazy,
  ElectricityReadingDetailPageLazy,
  ElectricityReadingGraphPageLazy,
  ExportHistoricalPageLazy,
  ExportPageLazy,
  HomePageLazy,
} from "pages";
import { ElectricityReadingDetailEditPageLazy } from "pages/ElectricityReadingPages/ElectricityReadingDetailEditPageLazy";
import { NotFoundPageLazy } from "pages/NotFoundPage/NotFoundPageLazy";
import { ProfilePageLazy } from "pages/ProfilePage/ProfilePageLazy";
import { LazyExoticComponent } from "react";
import { generatePath, matchPath } from "react-router-dom";

interface RouteEnumItem {
  appBarName?: string;
  path: string;
  element: LazyExoticComponent<() => JSX.Element>;
  highlightAppBarName?: string; // the name of the appBarName to highlight when on this page
}

interface AppBarRouteEnumItem {
  appBarName: string;
  path: string;
  element: LazyExoticComponent<() => JSX.Element>;
  highlightAppBarName?: string; // the name of the appBarName to highlight when on this page
}

// Order doesn't matter for react-router-v6 (it's smarter than v5),
// but matters for my findFirstMatch() function below.
export const routeEnum = {
  Home: {
    path: "/",
    element: HomePageLazy,
  },
  ElectricityUpload: {
    appBarName: "Submit Reading",
    path: "/electricity-readings/upload",
    element: ElectricityReadingCreatePageLazy,
    highlightAppBarName: "Submit Reading",
  },
  ElectricityGraph: {
    appBarName: "Electricity Readings",
    path: "/electricity-readings",
    element: ElectricityReadingGraphPageLazy,
    highlightAppBarName: "Electricity Readings",
  },
  ElectricityDetail: {
    path: "/electricity-readings/:id",
    element: ElectricityReadingDetailPageLazy,
    highlightAppBarName: "Electricity Readings",
  },
  ElectricityDetailEdit: {
    path: "/electricity-readings/:id/edit",
    element: ElectricityReadingDetailEditPageLazy,
    highlightAppBarName: "Electricity Readings",
  },
  Profile: {
    path: "/profile",
    element: ProfilePageLazy,
  },
  Export: {
    appBarName: "Export Data",
    path: "/export",
    element: ExportPageLazy,
    highlightAppBarName: "Export Data",
  },
  ExportHistorical: {
    path: "/export/historical",
    element: ExportHistoricalPageLazy,
    highlightAppBarName: "Export Data",
  },
  Default: {
    path: "*",
    element: NotFoundPageLazy,
  },
};

export const appBarRouteEnum: Record<
  keyof typeof routeEnum,
  AppBarRouteEnumItem
> = Object.entries<RouteEnumItem>(routeEnum)
  .filter(([, item]) => item.appBarName !== undefined)
  .reduce((acc, [name, item]) => {
    acc[name as keyof typeof routeEnum] = item as AppBarRouteEnumItem;
    return acc;
  }, {} as Record<keyof typeof routeEnum, AppBarRouteEnumItem>);

export const generateElectricityDetailPath = (id: number) =>
  generatePath(routeEnum.ElectricityDetail.path, { id: id.toString() });

export const generateElectricityDetailEditPath = (id: number) =>
  generatePath(routeEnum.ElectricityDetailEdit.path, { id: id.toString() });

export const findFirstMatch = (currentPathname: string) => {
  return Object.entries<RouteEnumItem>(routeEnum).find(
    ([, item]) => matchPath(item.path, currentPathname) !== null
  );
};
