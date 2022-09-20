import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import OutletIcon from "@mui/icons-material/Outlet";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { CURRENT_APP_VERSION } from "pages/ChangelogPage/ChangelogPage";
import { useNavigate } from "react-router-dom";
import { routeEnum } from "routes/RouteEnum";
import { LightDarkToggle } from "./LightDarkToggle";
import LoginButton from "./LoginButton";

export const UnauthenticatedAppBar = () => {
  const navigate = useNavigate();

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
        </Box>
        {brandText}
        {versionText}

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
