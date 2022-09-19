import { useAuth0 } from "@auth0/auth0-react";
import CloseIcon from "@mui/icons-material/Close";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import MenuIcon from "@mui/icons-material/Menu";
import OutletIcon from "@mui/icons-material/Outlet";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { grey } from "@mui/material/colors";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { appBarRouteEnum, findFirstMatch, routeEnum } from "routes/RouteEnum";
import { LightDarkToggle } from "./LightDarkToggle";
import LogoutMenuItem from "./LogoutMenuItem";
import { useUserServerSlice } from "./store";

export const AuthenticatedAppBar = () => {
  // GENERAL HOOKS
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { getAccessTokenSilently, user } = useAuth0();

  // HOOKS FOR FETCHING DATA
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  // Server redux state selectors
  const {
    actions: { getUserRequest },
    selectors: { selectGetUserData, selectGetUserError },
  } = useUserServerSlice();
  const userData = useSelector(selectGetUserData);
  const userError = useSelector(selectGetUserError);
  useEffect(() => {
    if (userError !== null) {
      setErrorSnackbarOpen(true);
    }
  }, [userError]);

  const getUser = async () => {
    const accessToken = await getAccessTokenSilently();
    dispatch(getUserRequest({ accessToken }));
  };
  const debouncedGetUser = _.debounce(getUser, 300);
  useEffect(() => {
    debouncedGetUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [navAnchorEl, setNavAnchorEl] = useState<HTMLElement | null>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleNavigateToPath = (path: string) => () => {
    setNavAnchorEl(null);
    navigate(path);
  };

  const handleNavigateToHome = () => navigate(routeEnum["Home"].path);

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
    userData !== null
      ? `${userData.display_name} (${userData.email})`
      : "<Error fetching user info>";

  return (
    <>
      <AppBar position="static">
        <Toolbar disableGutters sx={{ paddingX: (theme) => theme.spacing(1) }}>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
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
              <ElectricalServicesIcon
                sx={{ marginLeft: 1, marginRight: -0.5 }}
              />
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
              {Object.values(appBarRouteEnum).map((item) => {
                const shouldHighlight =
                  findFirstMatch(location.pathname)?.[1]
                    ?.highlightAppBarName === item.appBarName;
                return (
                  <Button
                    disableRipple
                    key={item.path}
                    onClick={handleNavigateToPath(item.path)}
                    sx={{
                      textTransform: "none",
                      backgroundColor: (theme) =>
                        !shouldHighlight
                          ? "default"
                          : theme.palette.mode === "light"
                          ? theme.palette.primary.light
                          : grey[700],
                      "&:hover": {
                        backgroundColor: (theme) =>
                          theme.palette.mode === "light"
                            ? theme.palette.primary.light
                            : grey[700],
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={shouldHighlight ? 700 : "auto"}
                    >
                      {item.appBarName}
                    </Typography>
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
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
              {Object.values(appBarRouteEnum).map((item) => {
                const shouldHighlight =
                  findFirstMatch(location.pathname)?.[1]
                    ?.highlightAppBarName === item.appBarName;
                return (
                  <MenuItem
                    key={item.path}
                    onClick={handleNavigateToPath(item.path)}
                    sx={{
                      backgroundColor: (theme) =>
                        !shouldHighlight
                          ? "default"
                          : theme.palette.mode === "light"
                          ? theme.palette.primary.light
                          : grey[700],
                    }}
                  >
                    {item.appBarName}
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          <Box
            sx={{
              display: "flex",
              marginLeft: "auto",
              alignItems: "center",
            }}
          >
            <Box sx={{ marginRight: -1 }}>
              <LightDarkToggle />
            </Box>
            <IconButton
              disableRipple
              onClick={(event) => setAvatarAnchorEl(event.currentTarget)}
            >
              <Tooltip title={getAvatarTooltip()}>
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
              <MenuItem
                onClick={() => {
                  setAvatarAnchorEl(null);
                  navigate(routeEnum.Profile.path);
                }}
              >
                Edit Profile
              </MenuItem>
              <Divider />
              <LogoutMenuItem />
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {userError !== null ? (
        <Snackbar
          open={errorSnackbarOpen}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => {}} // disable timeout, clickaway and escapeKeyDown from closing snackbar
        >
          <Alert
            variant="filled"
            severity="error"
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setErrorSnackbarOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            Error fetching user info: {userError.requestErrorDescription}{" "}
            (Please report this bug!)
          </Alert>
        </Snackbar>
      ) : null}
    </>
  );
};
