import { createRootRouteWithContext } from "@tanstack/react-router";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

interface AppContext {
  serviceTypes: ServiceType[];
  authUser?: User;
  authUserIsAdmin: boolean;
}

export const Route = createRootRouteWithContext<AppContext>()();
