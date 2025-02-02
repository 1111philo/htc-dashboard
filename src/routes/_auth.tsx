import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  beforeLoad: ({ location }): Partial<AppContext> => {
    const { authUser } = useGlobalStore.getState()
    if (!authUser) {
      throw redirect({
        to: "/login",
        search: {
          // Use the current location to power a redirect after login
          redirect: location.href,
        },
      });
    }
    const authUserIsAdmin = authUser.role === "admin"
    return { authUser, authUserIsAdmin }
  },
});

function RouteComponent() {
  return <Outlet />;
}
