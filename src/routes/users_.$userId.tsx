import { createFileRoute } from '@tanstack/react-router'
import UserProfileView from '../views/UserProfileView'

export const Route = createFileRoute('/users_/$userId')({
  component: UserProfileView,
})
