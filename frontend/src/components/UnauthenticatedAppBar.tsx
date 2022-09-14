import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import MenuIcon from "@mui/icons-material/Menu";
import OutletIcon from "@mui/icons-material/Outlet";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeEnum } from "routes/RouteEnum";
import { LightDarkToggle } from "./LightDarkToggle";
import LoginButton from "./LoginButton";
import LoginMenuItem from "./LoginMenuItem";

export const UnauthenticatedAppBar = () => {
  const navigate = useNavigate();

  const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);

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
            <ElectricalServicesIcon sx={{ marginLeft: 2, marginRight: -0.5 }} />
            <OutletIcon sx={{ marginRight: 1 }} />
          </IconButton>
          {brandText}
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
            <LoginMenuItem />
          </Menu>
        </Box>

        <Box
          sx={{
            display: "flex",
            marginLeft: "auto",
            alignItems: "center",
          }}
        >
          <LightDarkToggle />
          <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <LoginButton />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
