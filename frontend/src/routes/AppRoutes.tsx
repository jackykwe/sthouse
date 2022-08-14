import { Route, Routes } from "react-router-dom";
import { routeEnum } from "./RouteEnum";

export const AppRoutes = () => (
  <Routes>
    {Object.values(routeEnum).map((item) => (
      <Route key={item.path} path={item.path} element={item.element()} />
    ))}
  </Routes>
);
