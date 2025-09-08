import axios from "axios";
import { obtenerSessionID } from "../utils/encryptToken";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // opcional: timeout de 10s
  withCredentials: false,
});

// Interceptor para agregar token a las cabeceras
api.interceptors.request.use(
  (config) => {
    const idSession = obtenerSessionID();
    if (idSession) {
      config.headers["id-session"] = `${idSession}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
