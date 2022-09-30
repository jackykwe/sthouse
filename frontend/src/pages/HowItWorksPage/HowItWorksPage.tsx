import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { BACKEND_API_URL } from "services";

export const HowItWorksPage = () => {
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
      {" "}
      <Box
        sx={{
          display: "flex",
          gap: (theme) => theme.spacing(1),
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Click</Typography>
        <Typography fontFamily="Jetbrains Mono" fontWeight={700}>
          <Link
            href={`${BACKEND_API_URL}/static/pdf/How-It-Works.pdf`}
            target="_blank" // new tab
            rel="noreferrer"
          >
            here
          </Link>
        </Typography>
        <Typography variant="h5">to download the PDF.</Typography>
      </Box>
      It's in PDF form because it's easier to write and it's prettier for
      readers.
    </Box>
  );
};

export default HowItWorksPage;
