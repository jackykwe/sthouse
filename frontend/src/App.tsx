import {
  createTheme,
  CssBaseline,
  PaletteMode,
  responsiveFontSizes,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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

  return (
    <ColourModeContext.Provider value={colourMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <Box
              sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
              }}
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
        </LocalizationProvider>
      </ThemeProvider>
    </ColourModeContext.Provider>
  );
};
