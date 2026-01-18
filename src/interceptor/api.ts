import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: "https://golden-nile-backend.vercel.app",
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("goldenNileToken");

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("goldenNileToken");
    }
    return Promise.reject(error);
  }
);

export default api;
