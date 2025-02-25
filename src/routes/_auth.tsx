import { createFileRoute, redirect } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import { fetchServices } from "../lib/api";
import App from "../App";

export const Route = createFileRoute("/_auth")({
  component: App,
  beforeLoad: async () => {
    const { authUser } = useGlobalStore.getState();
    if (!authUser) {
      throw redirect({ to: "/" });
    }
    const authUserIsAdmin = authUser?.role === "admin";
    const { serviceTypes } = await fetchGlobalData();
    return {
      serviceTypes,
      authUser,
      authUserIsAdmin,
    };
  },
  loader: ({ context }) => context,
});

async function fetchGlobalData() {
  // get the current list of service types for services subnav
  const serviceTypes = await fetchServices();
  return { serviceTypes };
}
