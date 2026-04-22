import { create } from "zustand";
import { persist } from "zustand/middleware";
import baseClient from "../api/baseClient";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isRefreshing: false,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),

      // LOGIN — Save Tokens in Store
      login: ({ access, refresh }) =>
        set({
          isAuthenticated: true,
          accessToken: access,
          refreshToken: refresh,
        }),

      // LOGOUT — Blacklist Refresh Token
      logout: async () => {
        const refresh = get().refreshToken;

        try {
          if (refresh) {
            await baseClient.post("/token/blacklist/", { refresh });
          }
        } catch (err) {
          console.error("Blacklist failed:", err);
        }

        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
      },

      // REFRESH TOKEN HANDLER
      refreshAccessToken: async () => {
        const refresh = get().refreshToken;

        if (!refresh || get().isRefreshing) return null;

        set({ isRefreshing: true });

        try {
          const res = await baseClient.post("/token/refresh/", { refresh });
          const newAccess = res.data.access;

          set({ accessToken: newAccess, isAuthenticated: true, isRefreshing: false });
          return newAccess;
        } catch (err) {
          console.error("Token refresh failed:", err);
          set({ isRefreshing: false });
          get().logout();
          return null;
        }
      },
    }),

    { 
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state.setHasHydrated(true);
      }
    }
  )
);
