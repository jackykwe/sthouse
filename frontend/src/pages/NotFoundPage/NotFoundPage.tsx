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
      <HelpOutlineIcon
        sx={{ fontSize: 72, paddingBottom: (theme) => theme.spacing(1) }}
      />
      <Typography variant="h4">Page not found</Typography>
    </Box>
  );
};

export default NotFoundPage;
