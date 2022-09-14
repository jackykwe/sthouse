import { useAuth0 } from "@auth0/auth0-react";
import MenuItem from "@mui/material/MenuItem";

export const LoginMenuItem = () => {
  const { loginWithRedirect } = useAuth0();

  return <MenuItem onClick={() => loginWithRedirect()}>Log In</MenuItem>;
};

export default LoginMenuItem;
