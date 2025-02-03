import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '../lib/components'
import { getUser } from '../lib/api'

interface LoaderData {
  user: User
}
export const Route = createFileRoute('/_auth/_admin/users_/$userId')({
  component: UserProfileView,
  parseParams: (params): { userId: string } => ({
    userId: params.userId
  }),
  loader: async ({ params }): Promise<LoaderData> => {
    const { userId } = params
    // TODO: fix the hack in 👇🏽 this request func when API accepts a user_id key in req body
    const user = await getUser(userId)
    return { user: user! }
  },
})

function UserProfileView() {
  const { user } = Route.useLoaderData()
  return <UserProfile user={user} />
}
