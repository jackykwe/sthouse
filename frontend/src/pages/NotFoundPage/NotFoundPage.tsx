import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const NotFoundPage = () => {
  // const navigate = useNavigate();
  // useEffect(() => {
  //   navigate(routeEnum.HomePage.path);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  // return <PageLoading />;
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
      <HelpOutlineIcon sx={{ fontSize: 60 }} />
      <Typography
        variant="h5"
        sx={{ margin: (theme) => theme.spacing(1) }}
        align="center"
      >
        Page not found
      </Typography>
    </Box>
  );
};

export default NotFoundPage;
