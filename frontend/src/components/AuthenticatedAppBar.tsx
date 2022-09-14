import { useAuth0 } from "@auth0/auth0-react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import OutletIcon from "@mui/icons-material/Outlet";
import { useTheme } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ColourModeContext } from "App";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appBarRouteEnum, routeEnum } from "routes/RouteEnum";
import LogoutMenuItem from "./LogoutMenuItem";

export const AuthenticatedAppBar = () => {
  const theme = useTheme();
  const colourMode = useContext(ColourModeContext);
  const navigate = useNavigate();
  const { user } = useAuth0();

  const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleNavigateToPath = (path: string) => () => {
    setNavAnchorEl(null);
    navigate(path);
  };

  const handleNavigateToHome = () => navigate(routeEnum["HomePage"].path);

  const brandText = (
    <Button
      disableRipple
      onClick={handleNavigateToHome}
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

  const getAvatarTooltip = () =>
    `${user?.given_name ?? user?.name} (${user?.email ?? "unknown email"})`;

  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ paddingX: (theme) => theme.spacing(1) }}>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
          }}
        >
          <IconButton
            disableRipple
            size="large"
            onClick={handleNavigateToHome}
            color="inherit"
            sx={{ padding: 0 }}
          >
            <ElectricalServicesIcon sx={{ marginLeft: 1, marginRight: -0.5 }} />
            <OutletIcon sx={{ marginRight: 1 }} />
          </IconButton>
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
          <IconButton
            size="large"
            onClick={(event) => setNavAnchorEl(event.currentTarget)}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          {brandText}
          <Menu
            keepMounted
            anchorEl={navAnchorEl}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            open={Boolean(navAnchorEl)}
            onClose={() => setNavAnchorEl(null)}
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
            <LogoutMenuItem />
          </Menu>
        </Box>

        <IconButton
          sx={{ marginLeft: "auto", marginRight: (theme) => theme.spacing(1) }}
          onClick={colourMode.toggleColourMode}
          color="inherit"
        >
          {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
          <IconButton
            disableRipple
            onClick={(event) => setAvatarAnchorEl(event.currentTarget)}
          >
            <Tooltip title={getAvatarTooltip()} arrow>
              <Avatar
                alt={user?.given_name ?? user?.name}
                src={user?.picture}
                sx={{
                  outlineStyle: Boolean(avatarAnchorEl) ? "solid" : "none",
                  outlineWidth: 4,
                  outlineColor: "#FFFFFF88",
                }}
              />
            </Tooltip>
          </IconButton>
          <Menu
            keepMounted
            anchorEl={avatarAnchorEl}
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
            transformOrigin={{ horizontal: "center", vertical: "top" }}
            open={Boolean(avatarAnchorEl)}
            onClose={() => setAvatarAnchorEl(null)}
            sx={{ display: "block" }}
          >
            <MenuItem disabled>Logged in as {getAvatarTooltip()}</MenuItem>
            <Divider />
            <LogoutMenuItem />
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
