import { createFileRoute } from '@tanstack/react-router'
import GuestsView from '../views/GuestsView'

export const Route = createFileRoute('/guests')({
  component: GuestsView,
})
