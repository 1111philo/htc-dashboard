import { createFileRoute } from "@tanstack/react-router";
import { getUser } from "../lib/api";
import { UserProfile } from "../lib/components";

export const Route = createFileRoute("/_auth/me")({
  component: MyAccount,
  loader: async ({ context }) => {
    // user can only see their own account
    const userSub = context.authUser!.sub;
    const user = await getUser(userSub);
    return { user };
  },
});

function MyAccount() {
  const { user } = Route.useLoaderData()
  if (!user) return "This page won't work until we can query"
  return <UserProfile user={user} isOwnAccount={true} />
}