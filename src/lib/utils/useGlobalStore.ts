import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchServices } from "../api";

interface GlobalStore {
  authUser: User | null;
  setAuthUser: (authUser: User | null) => void;

  serviceTypes: ServiceType[];
  refreshServices: () => Promise<void>;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      authUser: null,
      setAuthUser: (authUser) => set({ authUser }),

      serviceTypes: [],
      refreshServices: async () => {
        set({ serviceTypes: await fetchServices() });
      },
    }),
    {
      name: "apolis-storage",
      partialize: (state) => ({ authUser: state.authUser }),
    },
  ),
);
