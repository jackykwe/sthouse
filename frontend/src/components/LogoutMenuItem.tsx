import { useAuth0 } from "@auth0/auth0-react";
import MenuItem from "@mui/material/MenuItem";

export const LogoutMenuItem = () => {
  const { logout } = useAuth0();

  return (
    <MenuItem onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </MenuItem>
  );
};

export default LogoutMenuItem;
