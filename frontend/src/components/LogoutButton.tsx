import { useAuth0 } from "@auth0/auth0-react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button
      disableRipple
      onClick={() => logout({ returnTo: window.location.origin })}
      sx={{ textTransform: "none", marginLeft: (theme) => theme.spacing(1) }}
    >
      <Typography variant="subtitle1">Log Out</Typography>
    </Button>
  );
};

export default LogoutButton;
