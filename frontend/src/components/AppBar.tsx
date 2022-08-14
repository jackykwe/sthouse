import DarkModeIcon from "@mui/icons-material/DarkMode";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import OutletIcon from "@mui/icons-material/Outlet";
import { useTheme } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { ColourModeContext } from "App";
import { MouseEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appBarRouteEnum, routeEnum } from "routes/RouteEnum";

// const settings = ["Profile", "Activity", "Logout"];

export const MyAppBar = () => {
  const theme = useTheme();
  const colourMode = useContext(ColourModeContext);

  const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setNavAnchorEl(event.currentTarget);
  };
  const handleCloseNavMenu = () => setNavAnchorEl(null);
  const handleNavigateToPath = (path: string) => () => {
    setNavAnchorEl(null);
    navigate(path);
  };

  const brandText = (
    <Button
      disableRipple
      onClick={() => navigate(routeEnum["HomePage"].path)}
      sx={{
        textTransform: "none",
        "&:hover": { backgroundColor: "transparent" },
      }}
    >
      <Typography noWrap variant="h5" fontWeight="bold">
        St House Utilities
      </Typography>
    </Button>
  );

  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ paddingX: (theme) => theme.spacing(1) }}>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
          }}
        >
          <ElectricalServicesIcon sx={{ marginLeft: 2, marginRight: -0.5 }} />
          <OutletIcon sx={{ marginRight: 1 }} />
          {brandText}
          <Box
            sx={{
              flexGrow: 1,
              marginLeft: 2,
              justifyContent: "flex-start",
            }}
          >
            {Object.values(appBarRouteEnum).map((item) => (
              <Button
                disableRipple
                key={item.path}
                onClick={handleNavigateToPath(item.path)}
                sx={{ textTransform: "none" }}
              >
                <Typography variant="subtitle1">{item.appBarName}</Typography>
              </Button>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center" }}>
          <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
            <MenuIcon />
          </IconButton>
          {brandText}
          <Menu
            keepMounted
            anchorEl={navAnchorEl}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            open={Boolean(navAnchorEl)}
            onClose={handleCloseNavMenu}
            sx={{ display: "block" }}
          >
            {Object.values(appBarRouteEnum).map((item) => (
              <MenuItem
                key={item.path}
                onClick={handleNavigateToPath(item.path)}
              >
                {item.appBarName}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <IconButton
          sx={{ ml: "auto" }}
          onClick={colourMode.toggleColourMode}
          color="inherit"
        >
          {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
