import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "../App";

/* NOTE: auth state is handled by useGlobalStore (zustand) */

interface AppContext {
  // needed by: new visit view, guest profile view, services nav dropdown
  serviceTypes: ServiceType[];
  hideNav: boolean;
}

export const appContext: AppContext = {
  serviceTypes: [],
  hideNav: false,
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: App,
  // this poorly named function returns ctx that gets mixed into the parent ctx (no parent here cuz root)
  beforeLoad: async ({ context }): Promise<Partial<AppContext>> => {
    const { serviceTypes } = await fetchGlobalData();
    return { serviceTypes };
  },
});

async function fetchGlobalData() {
  // get the current list of service types
  let response = await fetch("../../sample-data/get_services.json");
  const serviceTypes: ServiceType[] = await response.json();
  return { serviceTypes };
}
