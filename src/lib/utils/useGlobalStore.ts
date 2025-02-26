import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchServices } from "../api";

interface AuthStore {
  authUser: User | null;
  setAuthUser: (authUser: User | null) => void;
}

/** Persists to local storage */
export const useAuthStore = create<AuthStore>()(
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

interface ServiceTypeStore {
  serviceTypes: ServiceType[];
  refreshServices: () => Promise<void>;
}

/** Non-persistent */
export const useServiceTypesStore = create<ServiceTypeStore>((set) => ({
  serviceTypes: [],
  refreshServices: async () => {
    set({ serviceTypes: await fetchServices() });
  },
}));
