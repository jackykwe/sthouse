import {
  ElectricityReadingClientState,
  ElectricityReadingServerState,
} from "pages/ElectricityReadingGraphPage/store/types";
import { UserServerState } from "pages/UserListPage/store/types";

export interface RootState {
  userServer?: UserServerState;
  electricityReadingClient?: ElectricityReadingClientState;
  electricityReadingServer?: ElectricityReadingServerState;
}
