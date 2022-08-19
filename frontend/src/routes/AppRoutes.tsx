import { PageLoading } from "pages/PageLoading/PageLoading";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { routeEnum } from "./RouteEnum";

export const AppRoutes = () => (
  <Suspense fallback={<PageLoading />}>
    <Routes>
      {Object.values(routeEnum).map((item) => (
        <Route key={item.path} path={item.path} element={<item.element />} />
      ))}
    </Routes>
  </Suspense>
);
