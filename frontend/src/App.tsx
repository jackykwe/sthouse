import { useAuth0 } from "@auth0/auth0-react";
import {
  createTheme,
  CssBaseline,
  PaletteMode,
  responsiveFontSizes,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
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

const authLoadingTexts = [
  "Vacuuming the floor...",
  "Taking out the trash...",
  "Unclogging the sink...",
  "Disarming the fire alarm...",
  "Washing dishes...",
  "Toasting bagels...",
  "Cooking rice...",
  "Cleaning the toilet...",
  "Removing laundry from washing machine...",
  "Collecting Asda delivery...",
  "Ensuring doors are locked...",
  "Adjusting the heater...",
];

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

  const { isLoading } = useAuth0();

  return (
    <ColourModeContext.Provider value={colourMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {isLoading ? (
            <Box
              sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={72} />
              <Typography
                variant="h5"
                sx={{ margin: (theme) => theme.spacing(2) }}
              >
                {
                  authLoadingTexts[
                    Math.floor(Math.random() * authLoadingTexts.length)
                  ]
                }
              </Typography>
            </Box>
          ) : (
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
          )}
        </LocalizationProvider>
      </ThemeProvider>
    </ColourModeContext.Provider>
  );
};
