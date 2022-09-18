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
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MyAppBar } from "components/AppBar/AppBar";
import { createContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { appThemeOptions } from "theme/theme";
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
  "Arming the fire alarm...",
  "Washing dishes...",
  "Toasting bagels...",
  "Cooking rice...",
  "Cleaning the toilet...",
  "Removing laundry from washing machine...",
  "Collecting Asda delivery...",
  "Ensuring doors are locked...",
  "Adjusting the heater...",
  "Resetting the tripped circuit breaker...",
];

const takingTooLongText = "Whoa, that's taking a while.";
const takingTooLongText2 = "You may want to try refreshing the page.";

const SELECTED_PALETTE_MODE_KEY = "selectedPaletteMode";
function selectedPaletteModeIsValid(
  selectedPaletteMode: string | null
): selectedPaletteMode is PaletteMode {
  return (
    selectedPaletteMode !== null &&
    ["light", "dark"].includes(selectedPaletteMode)
  );
}

export const App = () => {
  const selectedPaletteMode = localStorage.getItem(SELECTED_PALETTE_MODE_KEY);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)"); // default false

  const [mode, setMode] = useState<PaletteMode>(
    selectedPaletteModeIsValid(selectedPaletteMode)
      ? selectedPaletteMode
      : prefersDarkMode
      ? "dark"
      : "light"
  );
  const colourMode = useMemo(
    () => ({
      toggleColourMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem(SELECTED_PALETTE_MODE_KEY, newMode);
          return newMode;
        });
      },
    }),
    []
  );
  // Update the theme only if the mode changes
  const theme = useMemo(
    () =>
      responsiveFontSizes(createTheme(appThemeOptions(mode)), {
        breakpoints: ["xs", "md"],
        factor: 8,
      }),
    [mode]
  );

  const [appLoadingTooSlow, setAppLoadingTooSlow] = useState(false);
  const [appLoadingTooSlowArmed, setAppLoadingTooSlowArmed] = useState(true);
  setTimeout(() => {
    setAppLoadingTooSlow(true);
  }, 5_000);

  const { isLoading } = useAuth0();
  useEffect(() => {
    if (!isLoading) {
      setAppLoadingTooSlowArmed(false);
    }
  }, [isLoading]);

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
              <Collapse in={appLoadingTooSlowArmed && appLoadingTooSlow}>
                <>
                  <Box sx={{ display: { xs: "none", md: "flex" } }}>
                    <Typography variant="body2" align="center" lineHeight={1}>
                      {takingTooLongText} {takingTooLongText2}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: {
                        xs: "flex",
                        md: "none",
                        flexDirection: "column",
                      },
                    }}
                  >
                    <Typography variant="body2" align="center" lineHeight={1}>
                      {takingTooLongText}
                    </Typography>
                    <Typography variant="body2" align="center" lineHeight={1}>
                      {takingTooLongText2}
                    </Typography>
                  </Box>
                </>
              </Collapse>
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
