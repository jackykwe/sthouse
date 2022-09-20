import { useAuth0 } from "@auth0/auth0-react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { grey } from "@mui/material/colors";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { PageError } from "pages/PageError/PageError";

interface AppVersion {
  number: string;
  date_repr: string;
  changes: string[]; // each element is one new line
}
const APP_VERSION_HISTORY: AppVersion[] = [
  // Latest in front
  {
    number: "1.0.0",
    date_repr: "21 Sep 2022",
    changes: ["Initial launch!"],
  },
];
export const CURRENT_APP_VERSION = APP_VERSION_HISTORY[0];

export const ChangelogPage = () => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <PageError errorMessage="Please log in to access this page." />;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: (theme) => theme.spacing(1.5),
      }}
    >
      {APP_VERSION_HISTORY.map((appVersion) => (
        <Card
          elevation={2}
          variant="outlined"
          sx={{ width: { xs: "100%", md: "auto" } }}
        >
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: (theme) => theme.spacing(1),
              }}
            >
              <Typography fontWeight={700}>
                Changelog (v{appVersion.number} on {appVersion.date_repr})
              </Typography>
              {appVersion.changes.map((line) => (
                <Typography lineHeight={1} align="justify">
                  {line}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

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

export default ChangelogPage;
