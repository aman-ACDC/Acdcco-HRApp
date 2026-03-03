// hr-app-landing-page/src/api/client.js
import baseClient from "./baseClient";
import { useAuthStore } from "../store/authStore"; 

const client = baseClient;

// ADDED: Request interceptor to attach JWT token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Robust response interceptor for token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login or refresh endpoints to avoid infinite loops
      const url = originalRequest.url;
      if (url.includes("/token/") || url.includes("/register/")) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      
      try {
        const newAccessToken = await useAuthStore.getState().refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        }
      } catch (refreshError) {
        console.error("Critical refresh error:", refreshError);
        useAuthStore.getState().logout();
      }
    }
    
    const msg = error.response?.data?.detail || error.message;
    console.error("[API error]", msg);
    return Promise.reject(error);
  }
);

export default client;
