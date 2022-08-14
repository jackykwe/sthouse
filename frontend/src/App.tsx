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
import { BrowserRouter } from "react-router-dom";
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

// const store = configureAppStore();

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

  // {/* <Provider store={store}> */}
  //   {/* </Provider> */}
  return (
    <ColourModeContext.Provider value={colourMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <BrowserRouter>
          <MyAppBar />
          <Box sx={{ padding: (theme) => theme.spacing(2) }}>
            <AppRoutes />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </ColourModeContext.Provider>
  );
};
