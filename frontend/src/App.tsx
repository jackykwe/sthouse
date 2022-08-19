import {
  createTheme,
  CssBaseline,
  PaletteMode,
  responsiveFontSizes,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import { createContext, useMemo, useState } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureAppStore } from "store/configureStore";
import { appThemeOptions } from "theme/theme";
import "./App.css";
import { MyAppBar } from "./components/AppBar";
import { AppRoutes } from "./routes/AppRoutes";

// axios.interceptors.request.use((config) => {
//   config.headers = {
//     "content-type": "application/json",
//     ...config.headers,
//     Authorization: `Bearer hahahaha`,
//   };
//   return config;
// });

export const ColourModeContext = createContext({ toggleColourMode: () => {} });

export const App = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)"); // default false

  const [mode, setMode] = useState<PaletteMode>(
    prefersDarkMode ? "dark" : "light"
  );
  const colourMode = useMemo(
    () => ({
      toggleColourMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === "light" ? "dark" : "light"
        );
      },
    }),
    []
  );
  // Update the theme only if the mode changes
  const theme = useMemo(
    () => responsiveFontSizes(createTheme(appThemeOptions(mode))),
    [mode]
  );

  const store = configureAppStore();
  return (
    <ColourModeContext.Provider value={colourMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Provider store={store}>
          <BrowserRouter>
            <Box
              sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
            >
              <MyAppBar />
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  padding: (theme) => theme.spacing(2),
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <AppRoutes />
              </Box>
            </Box>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </ColourModeContext.Provider>
  );
};
