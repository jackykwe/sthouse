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
import { generatePath } from "react-router-dom";

interface RouteEnumItem {
  appBarName?: string;
  path: string;
  element: LazyExoticComponent<() => JSX.Element>;
}

interface AppBarRouteEnumItem {
  appBarName: string;
  path: string;
  element: LazyExoticComponent<() => JSX.Element>;
}

export const routeEnum = {
  Home: {
    path: "/",
    element: HomePageLazy,
  },
  ElectricityUpload: {
    appBarName: "Submit Reading",
    path: "/electricity-readings/upload",
    element: ElectricityReadingCreatePageLazy,
  },
  ElectricityGraph: {
    appBarName: "Electricity Readings",
    path: "/electricity-readings",
    element: ElectricityReadingGraphPageLazy,
  },
  ElectricityDetail: {
    path: "/electricity-readings/:id",
    element: ElectricityReadingDetailPageLazy,
  },
  ElectricityDetailEdit: {
    path: "/electricity-readings/:id/edit",
    element: ElectricityReadingDetailEditPageLazy,
  },
  Profile: {
    path: "/profile",
    element: ProfilePageLazy,
  },
  Export: {
    appBarName: "Export Data",
    path: "/export",
    element: ExportPageLazy,
  },
  ExportHistorical: {
    path: "/export/historical",
    element: ExportHistoricalPageLazy,
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
