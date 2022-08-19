import axios from "axios";

export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

const instance = axios.create();
export default instance;
