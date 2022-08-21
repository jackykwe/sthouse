import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { configureAppStore } from "store/configureStore";
import { App } from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const store = configureAppStore();

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
