import { createFileRoute, redirect } from '@tanstack/react-router'
import { UserProfile } from '../lib/components'
import { getUserById } from '../lib/api'

interface URLParams {
  userId: number;
}

interface LoaderData {
  user: User;
  isOwnAccount: boolean;
}
export const Route = createFileRoute('/_auth/_admin/users_/$userId')({
  component: UserProfileView,
  parseParams: (params): URLParams => ({
    userId: Number(params.userId),
  }),
  loader: async ({ context, params }): Promise<LoaderData> => {
    const { userId } = params
    const user = await getUserById(userId)
    if (!user) throw redirect({ to: '/users', replace: true })
    const isOwnAccount = context.authUser!.user_id === user.user_id
    return { user, isOwnAccount }
  },
})

function UserProfileView() {
  const { user, isOwnAccount } = Route.useLoaderData()
  return <UserProfile user={user} isOwnAccount={isOwnAccount} />
}
