// interface ElectricityReadingDetailPageProps {}

import { NotFoundPageLazy } from "pages/NotFoundPage/NotFoundPageLazy";
import { useParams } from "react-router-dom";

const isValidParam = (id: string) => /^\d+$/.test(id);

export const ElectricityReadingDetailPage = () => {
  const { id } = useParams();
  if (id === undefined || !isValidParam(id)) {
    return <NotFoundPageLazy />;
  }

  return <span>DETAIL {id}</span>;
};

export default ElectricityReadingDetailPage;
