import {
  ElectricityReadingCreatePageLazy,
  ElectricityReadingGraphPageLazy,
  HomePageLazy,
  UserListPageLazy,
} from "pages";
import { CallbackPageLazy } from "pages/CallbackPage/CallbackPageLazy";
import { ElectricityReadingDetailPageLazy } from "pages/ElectricityReadingDetailPage/ElectricityReadingDetailPageLazy";
import { NotFoundPageLazy } from "pages/NotFoundPage/NotFoundPageLazy";
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
  HomePage: {
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
  UserList: {
    appBarName: "Users (Debug)",
    path: "/users",
    element: UserListPageLazy,
  },
  Auth0Callback: {
    path: "/callback",
    element: CallbackPageLazy,
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
