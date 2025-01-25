import { createFileRoute } from '@tanstack/react-router'
import NewNotificationView from '../views/NewNotificationView'

export const Route = createFileRoute('/new-notification')({
  component: NewNotificationView,
})
