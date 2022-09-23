import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { TakingTooLongCollapse } from "components/TakingTooLongCollapse";
import { useState } from "react";

export const FetchingData = () => {
  const [pageLoadingTooSlow, setPageLoadingTooSlow] = useState(false);
  setTimeout(() => {
    setPageLoadingTooSlow(true);
  }, 5_000);

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
      <Typography variant="h5" sx={{ margin: (theme) => theme.spacing(1) }}>
        Fetching data, just one moment...
      </Typography>
      <TakingTooLongCollapse show={pageLoadingTooSlow} />
    </Box>
  );
};
