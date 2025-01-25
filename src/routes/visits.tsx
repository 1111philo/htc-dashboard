import { createFileRoute } from '@tanstack/react-router'
import VisitsView from '../views/VisitsView'

export const Route = createFileRoute('/visits')({
  component: VisitsView,
})
