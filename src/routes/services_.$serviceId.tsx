import { createFileRoute } from '@tanstack/react-router'
import ServiceView from '../views/ServiceView'

export const Route = createFileRoute('/services_/$serviceId')({
  component: ServiceView,
})
