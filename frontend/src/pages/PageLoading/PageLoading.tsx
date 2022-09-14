import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export const PageLoading = () => {
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
    </Box>
  );
};
