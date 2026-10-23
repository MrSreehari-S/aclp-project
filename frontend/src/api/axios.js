import axios from "axios";

const rawBaseURL =
  import.meta.env.VITE_API_BASE_URL || "https://aclp-project.onrender.com/api";

const baseURL = rawBaseURL.replace(/\/+$/, "").replace(/\/api$/, "") + "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
