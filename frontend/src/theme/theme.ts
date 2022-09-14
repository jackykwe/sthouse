import "@fontsource/fira-sans";
import "@fontsource/jetbrains-mono";
import { PaletteMode, ThemeOptions } from "@mui/material";

// From https://bareynol.github.io/mui-theme-creator/
export const appThemeOptions: (mode: PaletteMode) => ThemeOptions = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#339388" : "#00796b",
    },
    secondary: {
      main: mode === "dark" ? "#c54949" : "#b71c1c",
    },
    error: {
      main: mode === "dark" ? "#e57373" : "#f44366",
    },
  },
  typography: {
    fontFamily: '"Fira Sans","Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiToolbar: {
      defaultProps: {
        color: mode === "dark" ? "default" : undefined,
      },
    },
    MuiButton: {
      defaultProps: {
        color: "inherit",
      },
    },
  },
});
