import { UserServerState } from "components/AppBar/store/types";
import { ElectricityReadingClientState } from "pages/ElectricityReadingPages/store/types";

export interface RootState {
  electricityReadingClient?: ElectricityReadingClientState;
  userServer?: UserServerState;
}
