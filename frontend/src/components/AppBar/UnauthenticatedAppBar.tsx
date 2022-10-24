import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import MenuIcon from "@mui/icons-material/Menu";
import OutletIcon from "@mui/icons-material/Outlet";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { grey } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { CURRENT_APP_VERSION } from "pages/ChangelogPage/ChangelogPage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { routeEnum } from "routes/RouteEnum";
import { BACKEND_API_URL } from "services";
import { LightDarkToggle } from "./LightDarkToggle";
import LoginButton from "./LoginButton";

export const UnauthenticatedAppBar = () => {
  const navigate = useNavigate();

  const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);

  const brandText = (
    <Button
      disableRipple
      onClick={() => navigate(routeEnum["Home"].path)}
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
  const versionText = (
    <Button
      disableRipple
      onClick={() => navigate(routeEnum["Changelog"].path)}
      sx={{
        textTransform: "none",
        "&:hover": { backgroundColor: "transparent" },
        minWidth: 0,
        paddingX: 0,
      }}
    >
      <Typography>v{CURRENT_APP_VERSION.number}</Typography>
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
            onClick={() => navigate(routeEnum["Home"].path)}
            color="inherit"
            sx={{ padding: 0 }}
          >
            <ElectricalServicesIcon sx={{ marginLeft: 2, marginRight: -0.5 }} />
            <OutletIcon sx={{ marginRight: 1 }} />
          </IconButton>
          {brandText}
          {versionText}
          <Box
            sx={{
              flexGrow: 1,
              marginLeft: 2,
              justifyContent: "flex-start",
            }}
          >
            <Button
              disableRipple
              sx={{
                textTransform: "none",
                "&:hover": {
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? theme.palette.primary.light
                      : grey[700],
                },
              }}
              href={`${BACKEND_API_URL}/static/html/privacy-policy.html`}
              target="_blank" // new tab
              rel="noreferrer"
            >
              <Typography variant="subtitle1">Legal</Typography>
            </Button>
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
          {versionText}
          <Menu
            keepMounted
            anchorEl={navAnchorEl}
            anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
            transformOrigin={{ horizontal: "left", vertical: "top" }}
            open={Boolean(navAnchorEl)}
            onClose={() => setNavAnchorEl(null)}
            sx={{ display: "block" }}
          >
            <Link
              href={`${BACKEND_API_URL}/static/html/privacy-policy.html`}
              target="_blank" // new tab
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <MenuItem>Legal</MenuItem>
            </Link>
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
          <LoginButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
