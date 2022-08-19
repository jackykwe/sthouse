import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export const PageLoading = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
};
