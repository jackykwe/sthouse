import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { ColourModeContext } from "App";
import { useContext } from "react";

export const LightDarkToggle = () => {
  const theme = useTheme();
  const colourMode = useContext(ColourModeContext);

  return (
    <IconButton
      sx={{
        margin: (theme) => theme.spacing(1),
      }}
      onClick={colourMode.toggleColourMode}
      color="inherit"
    >
      {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
};
