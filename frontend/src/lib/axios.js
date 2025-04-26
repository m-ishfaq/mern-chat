import axios from "axios";

export const backendURL =
  import.meta.env.MODE === "development" ? "http://localhost:5001/" : "/";

export const axiosInstance = axios.create({
  baseURL: backendURL + "api",
  withCredentials: true,
});
