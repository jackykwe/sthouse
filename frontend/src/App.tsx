import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import {
  CallbackPage,
  ElectricityReadingCreatePage,
  ElectricityReadingsGraphPage,
  HomePage,
  NotFoundPage,
} from "./pages";
// import { HomePage, CreateElectricityReadingPage } from './pages';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/electricity-readings/upload"
          element={<ElectricityReadingCreatePage />}
        />
        <Route
          path="/electricity-readings"
          element={<ElectricityReadingsGraphPage />}
        />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
