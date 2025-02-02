import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isLoggedIn } from "../lib/api";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    if (!(await isLoggedIn())) {
      throw redirect({
        to: "/login",
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
        },
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
