import { createRootRouteWithContext } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "../App";

import * as API from "aws-amplify/api";
import { useGlobalStore } from "../lib/utils";
import { fetchServices } from "../lib/api";

/* NOTE: auth state is handled by useGlobalStore (zustand) */

export const appContext: AppContext = {
  serviceTypes: [],
  authUser: null,
  authUserIsAdmin: false,
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: App,
  // this poorly named function returns ctx that gets mixed into the parent ctx (no parent here cuz root)
  beforeLoad: async (): Promise<Partial<AppContext>> => {
    const { serviceTypes } = await fetchGlobalData();
    const { authUser } = useGlobalStore.getState()
    const authUserIsAdmin = authUser?.role === "admin"
    return { serviceTypes, authUser, authUserIsAdmin };
  },
  loader: ({ context }) => {
    return context;
  },
});

async function fetchGlobalData() {
  // get the current list of service types for services subnav
  const serviceTypes = await fetchServices()

  return { serviceTypes };
}
