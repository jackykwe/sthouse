import { useEffect, useState } from "react";
import { UserReadDTO } from "services/users";

export const UserListPage = () => {
  const [userList, setUserList] = useState<UserReadDTO[]>([]);
  useEffect(() => {
    setUserList([
      { id: 14, display_name: "Alice", email: "alice@example.com" },
      { id: 15, display_name: "Bob", email: "bob@example.com" },
    ]);
  }, []);
  // useEffect(() => {
  //   const getUserList = async () => {
  //     const newUserList = await axiosGetAllUsers();
  //     setUserList(newUserList);
  //   };
  //   getUserList();
  // }, []);

  return <span>USERS LOL: {JSON.stringify(userList)}</span>;
};
