import { PaletteMode, ThemeOptions } from "@mui/material";

export const appThemeOptions: (mode: PaletteMode) => ThemeOptions = (mode) => ({
  palette: {
    mode,
    primary: {
      main: "#00796b",
    },
    secondary: {
      main: "#b71c1c",
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
