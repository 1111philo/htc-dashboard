import { createFileRoute, redirect } from "@tanstack/react-router";
import { isLoggedIn } from "../lib/api";

export const Route = createFileRoute("/_auth/")({
  beforeLoad: async ({ location }) => {
    if (await isLoggedIn()) throw redirect({ to: "/new-visit" }) 
    throw redirect({
      to: "/login",
      search: {
        // Use the current location to power a redirect after login
        // (Do not use `router.state.resolvedLocation` as it can
        // potentially lag behind the actual current location)
        redirect: location.href,
      },
    });
  },
});
