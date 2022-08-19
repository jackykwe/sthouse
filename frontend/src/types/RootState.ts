import { ElectricityReadingServerState } from "pages/ElectricityReadingGraphPage/store/types";
import { UserServerState } from "pages/UserListPage/store/types";

export interface RootState {
  userServer?: UserServerState;
  electricityReadingServer?: ElectricityReadingServerState;
}
