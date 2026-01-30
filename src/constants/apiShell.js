import axios from "axios";

const API_URL_APP_SHELL = import.meta.env.DEV
  ? import.meta.env.VITE_API_APP_SHELL_DESARROLLO
  : import.meta.env.VITE_API_APP_SHELL;

const APP_SHELL_API_KEY = import.meta.env.VITE_API_KEY_APP_SHELL;

const apiShell = axios.create({
  baseURL: API_URL_APP_SHELL,
  timeout: 300000, // 300 segundos
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

if (APP_SHELL_API_KEY) {
  apiShell.defaults.headers.common["X-Portal-API-Key"] = APP_SHELL_API_KEY;
} else {
  console.warn("⚠️ APP_SHELL_API_KEY no está definido. Verifica la variable de entorno VITE_API_KEY_APP_SHELL");
}

apiShell.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

export default apiShell;
export const axiosInstanceAppShell = apiShell;
