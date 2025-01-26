import {
  createRootRouteWithContext,
  Outlet,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "../App";

// TODO - add auth status
interface AppContext {
  user: User | null;
  // needed by: new visit view, guest profile view, services nav dropdown
  serviceTypes: ServiceType[] | null;
  hideNav: boolean;
}

export const appContext: AppContext = {
  user: null,
  serviceTypes: null,
  hideNav: false,
};

export const Route = createRootRouteWithContext<AppContext>()({
  component: () => {
    const r = useRouter();
    if (r.state.location.pathname === "/login") return <Outlet />;
    return <App />;
  },
  beforeLoad: async (): Promise<Partial<AppContext>> => {
    // this poorly named function returns ctx that gets mixed into the parent ctx
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
