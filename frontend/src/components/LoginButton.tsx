import { useAuth0 } from "@auth0/auth0-react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      disableRipple
      onClick={() => loginWithRedirect()}
      sx={{ textTransform: "none" }}
    >
      <Typography variant="subtitle1">Log In</Typography>
    </Button>
  );
};

export default LoginButton;
