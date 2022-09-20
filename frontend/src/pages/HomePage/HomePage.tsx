import { useAuth0 } from "@auth0/auth0-react";
import { Collapse } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { grey } from "@mui/material/colors";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useUserServerSlice } from "components/AppBar/store";
import jwt_decode from "jwt-decode";
import _ from "lodash";
import { useEffect, useState } from "react";
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
    "It seems like you havent been assigned permissions to access the rest of the app.";
  const noPermsText2 = "If I'm not yet aware of this, please let me know!";
  const feedbackWelcomeText =
    "All user experience feedback is welcomed and appreciated!";
  const bugsText =
    "If you encounter any bugs, please tell me where they are, and I'll go squish them.";

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
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            marginBottom: (theme) => theme.spacing(2),
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginX: (theme) => theme.spacing(1) }}
          >
            Last reading was submitted on:
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {latestMillis !== null
              ? formatMillisInTzUtil(latestMillis, DATE_FMTSTR_HMSDDMY_TZ)
              : ""}
          </Typography>
        </Box>
      </Collapse>

      <Typography variant="h5">Use the app bar above to navigate.</Typography>

      <Card elevation={2} sx={{ margin: (theme) => theme.spacing(2) }}>
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

            <Collapse in={hasNoElecPerms}>
              <Typography align="center" lineHeight={1}>
                {noPermsText1}
              </Typography>
              <Typography align="center" lineHeight={1}>
                {noPermsText2}
              </Typography>
            </Collapse>

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
      <Typography
        variant="body2"
        fontStyle="italic"
        sx={{ marginTop: "auto" }}
        color={grey[500]}
      >
        Source code available{" "}
        <Link href="https://github.com/jackykwe/sthouse">here</Link>.
      </Typography>
    </Box>
  );
};

export default HomePage;
