import { createFileRoute } from '@tanstack/react-router'
import GuestProfileView from '../views/GuestProfileView'

export const Route = createFileRoute('/guests_/$guestId')({
  component: GuestProfileView,
})