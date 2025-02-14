import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "../lib/api";
import { UserProfile } from "../lib/components";

export const Route = createFileRoute("/_auth/me")({
  component: MyAccount,
  loader: async ({ context }) => {
    // user can only see their own account
    const userSub = context.authUser!.sub;
    const user = await getUser(userSub);
    if (!user) throw redirect({ to: "/users", replace: true })
    return { user };
  },
});

function MyAccount() {
  const { user } = Route.useLoaderData()
  return <UserProfile user={user!} isOwnAccount={true} />
}