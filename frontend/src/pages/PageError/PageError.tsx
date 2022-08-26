import Box from "@mui/material/Box";

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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {errorMessage}
    </Box>
  );
};
