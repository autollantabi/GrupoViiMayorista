import axios from "axios";

const baseURL = import.meta.env.VITE_API_APP_SHELL;

const apiShell = axios.create({
  baseURL: baseURL,
  timeout: 45000, // opcional: timeout de 45s
  withCredentials: false,
});

apiShell.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiShell;
