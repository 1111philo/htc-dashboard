import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGlobalStore = create(
  persist(
    (set) => ({
      authenticated: false,
      setAuthenticated: (value) => set(() => ({ authenticated: value })),
    }),
    {
      name: "apolis-storage",
      partialize: (state) => ({
        authenticated: state.authenticated,
      }),
    }
  )
);
