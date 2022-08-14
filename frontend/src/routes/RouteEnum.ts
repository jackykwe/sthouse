import {
  CallbackPage,
  ElectricityReadingCreatePage,
  ElectricityReadingGraphPage,
  HomePage,
  NotFoundPage,
  UserListPage,
} from "pages";

interface RouteEnumItem {
  appBarName?: string;
  path: string;
  element: () => JSX.Element;
}

interface AppBarRouteEnumItem {
  appBarName: string;
  path: string;
  element: () => JSX.Element;
}

export const routeEnum = {
  HomePage: {
    path: "/",
    element: HomePage,
  },
  ElectricityGraph: {
    appBarName: "Electricity Readings",
    path: "/electricity-readings",
    element: ElectricityReadingGraphPage,
  },
  ElectricityUpload: {
    path: "/electricity-readings/upload",
    element: ElectricityReadingCreatePage,
  },
  UserList: {
    appBarName: "Users (Debug)",
    path: "/users",
    element: UserListPage,
  },
  Auth0Callback: {
    path: "/callback",
    element: CallbackPage,
  },
  Default: {
    path: "*",
    element: NotFoundPage,
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
