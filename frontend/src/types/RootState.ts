import { ElectricityReadingClientState } from "pages/ElectricityReadingPages/store/types";
import { UserServerState } from "pages/UserListPage/store/types";

export interface RootState {
  userServer?: UserServerState;
  electricityReadingClient?: ElectricityReadingClientState;
}
