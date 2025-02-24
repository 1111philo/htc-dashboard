import { IndexView } from "../lib/components/IndexView";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";

export const Route = createFileRoute("/")({
  component: IndexView,
  beforeLoad: async () => {
    const { authUser } = useGlobalStore.getState();
    if (authUser) throw redirect({ to: "/new-visit", replace: true });
  },
});
