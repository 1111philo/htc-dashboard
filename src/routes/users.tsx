import { createFileRoute } from '@tanstack/react-router'
import UsersView from '../views/UsersView'

export const Route = createFileRoute('/users')({
  component: UsersView,
})