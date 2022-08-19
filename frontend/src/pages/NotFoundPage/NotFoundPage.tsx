import { PageLoading } from "pages/PageLoading/PageLoading";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routeEnum } from "routes/RouteEnum";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(routeEnum.HomePage.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <PageLoading />;
};

export default NotFoundPage;
