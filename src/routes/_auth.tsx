import { createFileRoute, redirect } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import App from "../App";

export const Route = createFileRoute("/_auth")({
  component: App,
  beforeLoad: async (): Promise<AppContext> => {
    const { serviceTypes: _serviceTypes, refreshServices } =
      useGlobalStore.getState();

    if (!_serviceTypes.length) {
      await refreshServices();
    }
    const { authUser, serviceTypes } = useGlobalStore.getState();
    if (!authUser) {
      throw redirect({ to: "/" });
    }
    const authUserIsAdmin = authUser?.role === "admin";
    return {
      serviceTypes,
      authUser,
      authUserIsAdmin,
      refreshServices,
    };
  },
  loader: ({ context }) => {
    return context;
  },
});
