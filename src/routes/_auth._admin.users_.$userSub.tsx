import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserProfile } from "../lib/components";
import { getUser } from "../lib/api";

interface LoaderData {
  user: User;
  isOwnAccount: boolean;
}
export const Route = createFileRoute("/_auth/_admin/users_/$userSub")({
  component: UserProfileView,
  parseParams: (params): { userSub: string } => ({
    userSub: params.userSub,
  }),
  loader: async ({ context, params }): Promise<LoaderData> => {
    const { userSub } = params;
    // TODO: fix the hack in 👇🏽 this request func when API accepts a user_id key in req body
    const user = await getUser(userSub);
    if (!user) throw redirect({ to: "/users", replace: true });
    const isOwnAccount = context.authUser!.sub === user?.sub;
    return { user, isOwnAccount };
  },
});

function UserProfileView() {
  const { user, isOwnAccount } = Route.useLoaderData();
  return <UserProfile user={user} isOwnAccount={isOwnAccount} />;
}
