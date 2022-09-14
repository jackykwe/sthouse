import { useAuth0 } from "@auth0/auth0-react";

export const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    <span>
      HOME {isAuthenticated.toString()}: {JSON.stringify(user)}
    </span>
  );
};

export default HomePage;
