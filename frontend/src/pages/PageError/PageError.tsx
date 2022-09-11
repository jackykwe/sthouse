import ErrorIcon from "@mui/icons-material/Error";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PageErrorProps {
  errorMessage: string;
}

export const PageError = (props: PageErrorProps) => {
  const { errorMessage } = props;
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ErrorIcon
        sx={{ fontSize: 60, paddingBottom: (theme) => theme.spacing(1) }}
        color="error"
      />
      <Typography variant="h5" color="error">
        {errorMessage}
      </Typography>
    </Box>
  );
};
