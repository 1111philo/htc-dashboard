import { createRootRouteWithContext } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "../App";

import * as API from "aws-amplify/api";

/* NOTE: auth state is handled by useGlobalStore (zustand) */

interface AppContext {
  // needed by: new visit view, guest profile view, services nav dropdown
  serviceTypes: ServiceType[];
}

export const appContext: AppContext = {
  serviceTypes: [],
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: App,
  // this poorly named function returns ctx that gets mixed into the parent ctx (no parent here cuz root)
  beforeLoad: async (): Promise<Partial<AppContext>> => {
    const { serviceTypes } = await fetchGlobalData();
    return { serviceTypes };
  },
  loader: ({ context }) => {
    return context;
  },
});

async function fetchGlobalData() {
  // get the current list of service types
  let response = await API.post({
    apiName: "auth",
    path: "/getServices",
  }).response;
  const serviceTypes: ServiceType[] = (await response.body.json())!.rows;
  return { serviceTypes };
}
