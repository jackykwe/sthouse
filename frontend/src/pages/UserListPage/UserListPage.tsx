import _ from "lodash";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUserServerSlice } from "./store";

export const UserListPage = () => {
  const dispatch = useDispatch();
  const {
    actions: { getUserListRequest },
    selectors: { selectGetUserListData },
  } = useUserServerSlice();
  const userList = useSelector(selectGetUserListData);

  const debouncedGetUserList = _.debounce(() => {
    dispatch(getUserListRequest());
  }, 300);

  useEffect(() => {
    debouncedGetUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {userList?.map(
        (dto) => `[${dto.id}] ${dto.display_name} (${dto.email}) `
      ) ?? "No data"}
    </>
  );
};

export default UserListPage;
