import { createFileRoute } from '@tanstack/react-router'
import AddServiceView from '../views/AddServiceView'

export const Route = createFileRoute('/add-service')({
  component: AddServiceView,
})
