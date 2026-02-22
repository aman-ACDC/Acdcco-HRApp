// hr-app-landing-page/src/api/client.js
import axios from "axios";
import { useAuthStore } from "../store/authStore"; 

const base = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: `${base}/api`,
  timeout: 15000,
});

// ADDED: Request interceptor to attach JWT token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message;
    console.error("[API error]", msg);
    return Promise.reject(err);
  }
);

export default client;
