import { useAuth0 } from "@auth0/auth0-react";
import { AuthenticatedAppBar } from "./AuthenticatedAppBar";
import { UnauthenticatedAppBar } from "./UnauthenticatedAppBar";

export const MyAppBar = () => {
  const { isAuthenticated } = useAuth0();

  return isAuthenticated ? <AuthenticatedAppBar /> : <UnauthenticatedAppBar />;
};
