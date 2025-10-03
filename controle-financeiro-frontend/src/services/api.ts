import axios from "axios";
import { auth } from "../auth/firebase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 30_000,
});

// Anexa ID Token (Firebase) se existir
api.interceptors.request.use(async (config) => {
  const u = auth.currentUser;
  if (u) {
    const token = await u.getIdToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor opcional p/ log
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[API ERROR]", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
