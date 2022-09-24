import { useAuth0 } from "@auth0/auth0-react";
import { Collapse } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useUserServerSlice } from "components/AppBar/store";
import jwt_decode from "jwt-decode";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { axiosGetLatestElectricityReadingMillis } from "services/electricity_readings";
import { isRequestError } from "types";
import { DATE_FMTSTR_HMSDDMY_TZ, formatMillisInTzUtil } from "utils/dateUtils";

export const HomePage = () => {
  // GENERAL HOOKS
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasNoElecPerms, setHasNoElecPerms] = useState(false);

  // HOOKS FOR FETCHING DATA
  const [latestMillis, setLatestMillis] = useState<number | null>(null);
  const getLatestMillis = async () => {
    if (!isAuthenticated) return;

    const accessToken = await getAccessTokenSilently();
    setAccessToken(accessToken);
    const responseData = await axiosGetLatestElectricityReadingMillis(
      accessToken
    );
    if (!isRequestError(responseData)) {
      setLatestMillis(responseData);
    }
  };
  const debouncedGetLatestMillis = _.debounce(getLatestMillis, 300);
  useEffect(() => {
    debouncedGetLatestMillis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accessToken === null) return;

    // Bodge job, quick and dirty
    const decodedToken: any = jwt_decode(accessToken);
    const permsLength: number | undefined = decodedToken?.permissions?.length;
    setHasNoElecPerms(permsLength !== undefined && permsLength === 0);
  }, [accessToken]);

  // Server redux state selectors
  const {
    selectors: { selectGetUserData },
  } = useUserServerSlice();
  const userData = useSelector(selectGetUserData);

  const noPermsText1 =
    "It seems like you haven't been assigned permissions to access the rest of the app.";
  const noPermsText2 = "If I'm not yet aware of this, please let me know!";
  const feedbackWelcomeText =
    "All user experience feedback is welcomed and appreciated!";
  const bugsText =
    "If you encounter any bugs, please tell me where they are, and I'll go squish them.";

  const nowMillis = useMemo(() => Date.now(), []);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">
          Please login to access the app's functionality.
        </Typography>
      </Box>
    );
  }

  const intlFormatter = new Intl.RelativeTimeFormat("en");

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Collapse in={latestMillis !== null}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: (theme) => theme.spacing(2),
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginX: (theme) => theme.spacing(1) }}
          >
            Last reading was submitted
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {intlFormatter.format(
              Math.ceil((latestMillis! - nowMillis) / 86_400_000), // ceil for negative numbers rounds towards 0
              "days"
            )}
          </Typography>
          <Typography
            variant="h5"
            sx={{ marginX: (theme) => theme.spacing(1) }}
          >
            on
          </Typography>
          <Typography variant="h4" fontWeight={700} noWrap>
            {latestMillis !== null
              ? formatMillisInTzUtil(latestMillis, DATE_FMTSTR_HMSDDMY_TZ)
              : ""}
          </Typography>
        </Box>
      </Collapse>

      <Typography variant="h5">Use the app bar above to navigate.</Typography>

      <Collapse in={hasNoElecPerms}>
        <Alert
          severity="info"
          sx={{
            marginTop: (theme) => theme.spacing(2),
            width: { xs: "100%", md: "auto" },
          }}
        >
          <AlertTitle>
            <strong>No permissions assigned</strong>
          </AlertTitle>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
            }}
          >
            <Typography align="center" lineHeight={1}>
              {noPermsText1}
            </Typography>{" "}
            <Typography align="center" lineHeight={1}>
              {noPermsText2}
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexDirection: "column",
            }}
          >
            <Typography align="center" lineHeight={1}>
              {noPermsText1} {noPermsText2}
            </Typography>
          </Box>
        </Alert>
      </Collapse>

      <Card
        elevation={2}
        sx={{
          marginTop: (theme) => theme.spacing(2),
          width: { xs: "100%", md: "auto" },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: (theme) => theme.spacing(1),
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Typography>Hello</Typography>
              <Collapse orientation="horizontal" in={userData !== null}>
                <Typography
                  sx={{ marginLeft: (theme) => theme.spacing(0.5) }}
                  noWrap
                >
                  {userData?.display_name}
                </Typography>
              </Collapse>
              <Typography>!</Typography>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
              }}
            >
              <Typography align="center" lineHeight={1}>
                {feedbackWelcomeText}
              </Typography>
              <Typography align="center" lineHeight={1}>
                {bugsText}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <Typography align="center" lineHeight={1}>
                {feedbackWelcomeText} {bugsText}
              </Typography>
            </Box>

            <Typography variant="body2" align="center">
              Cheers ~ Jacky
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomePage;
