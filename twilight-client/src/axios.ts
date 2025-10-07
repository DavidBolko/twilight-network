import axios from "axios";
import { router } from "./main";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      router.navigate({
        to: "/error",
        search: { message: "Server is unreachable. Please try again later." },
      });
    } else if (error.response.status >= 500) {
      router.navigate({
        to: "/error",
        search: { message: "Unexpected server error occurred." },
      });
    }
    return Promise.reject(error);
  },
);

export default api;
