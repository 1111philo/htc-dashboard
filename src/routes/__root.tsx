import { createRootRouteWithContext } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "../App";

// TODO - add auth status
interface AppContext {
  user: User | null;
  // needed by: new visit view, guest profile view, services nav dropdown
  serviceTypes: ServiceType[] | null;
}

export const Route = createRootRouteWithContext<AppContext>()({
  component: App,
  beforeLoad: async () => {
    // this poorly named function returns context by definition
    let response = await fetch("../../sample-data/get_services.json");
    const serviceTypes: ServiceType[] = await response.json();
    return { serviceTypes };
  },
});
