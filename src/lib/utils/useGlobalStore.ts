import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalStore {
  authUser: User | null;
  setAuthUser: (authUser: User) => void;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      authUser: null,
      setAuthUser: (authUser) => set({ authUser }),
    }),
    {
      name: "apolis-storage",
      partialize: (state) => ({ authUser: state.authUser }),
    },
  ),
);
