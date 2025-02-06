import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from 'react-bootstrap'
import { FeedbackMessage, GuestProfileForm, Notifications, Services } from '../lib/components'
import { deleteGuest, getGuestData } from '../lib/api'

interface NotificationGroups {
  active: GuestNotification[]
  archived: GuestNotification[]
}
interface LoaderData {
  guest: Guest
  services: GuestService[]
  notifications: NotificationGroups
}

export const Route = createFileRoute('/_auth/guests_/$guestId')({
  component: GuestProfileView,
  parseParams: (params): { guestId: number } => ({
    guestId: parseInt(params.guestId),
  }),
  loader: async ({ context, params }): Promise<LoaderData> => {
    const { serviceTypes } = context
    const { guestId } = params
    const guestResponse = await getGuestData(guestId)
    const { total, ...guest } = guestResponse
    let { guest_services: services, guest_notifications } = guest

    services = services
      .filter((s) => s.status === 'Completed')
      .map((s) => {
        let { name: service_name } = serviceTypes!.find(
          (t) => t.service_id === s.service_id,
        ) ?? { name: null }
        !service_name && (service_name = '[Service No Longer Exists]')
        return { ...s, service_name }
      })

    const notifications = {
      active: guest_notifications.filter((n) => n.status === 'Active'),
      archived: guest_notifications.filter((n) => n.status === 'Archived'),
    }

    return { guest, services, notifications }
  },
})

// TODO: eventually revive the visits table
export default function GuestProfileView() {
  const {
    guest,
    services,
    notifications: _notifications,
  } = Route.useLoaderData()

  const [notifications, setNotifications] = useState(_notifications)

  const navigate = useNavigate()

  const [feedback, setFeedback] = useState<UserMessage>({
    text: '',
    isError: false,
  })

  const guestId = guest.guest_id.toString().padStart(5, '0')

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Guest Profile</h1>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={async () => await deleteGuestRecord(guest.guest_id)}
        >
          Delete Guest Record
        </Button>
      </div>

      <h4>ID: {guestId}</h4>

      <FeedbackMessage message={feedback} />

      <GuestProfileForm guest={guest} onFeedback={setFeedback} />

      <h2 className="mb-3">Active Notifications</h2>
      <Notifications
        notifications={notifications.active}
        onToggleStatus={onToggleNotificationStatus}
      />

      <h2 className="mb-3">Archived Notifications</h2>
      <Notifications
        notifications={notifications.archived}
        onToggleStatus={onToggleNotificationStatus}
      />

      <h2 className="mb-3">Completed Services</h2>
      <Services services={services} />
    </>
  )

  async function deleteGuestRecord(guestId) {
    if (
      !confirm(
        `Are you sure you want to delete this guest?
        ${guest.first_name} ${guest.last_name}, born ${guest.dob}`,
      )
    ) {
      return
    }
    const success = await deleteGuest(guestId)
    if (!success) {
      setFeedback({
        text: `Oops! The guest record couldn't be deleted. Try again in a few.`,
        isError: true,
      })
      return
    }
    navigate({ to: '/guests', replace: true })
  }

  function onToggleNotificationStatus(
    success: boolean,
    notificationId: number,
    initialStatus: GuestNotificationStatus,
  ) {
    if (!success) return
    // move the item to the other notifications array
    // (if we want to move to the TOP of the other array, remove both `.sort()`s)
    let active: GuestNotification[]
    let archived: GuestNotification[]
    let moved: GuestNotification
    if (initialStatus === 'Active') {
      active = notifications.active.filter(
        (n) => n.notification_id !== notificationId,
      )
      moved = {
        ...notifications.active.find(
          (n) => n.notification_id === notificationId,
        )!,
        status: 'Archived',
      }
      archived = [moved, ...notifications.archived].sort((a, b) => {
        const aTime = new Date(a.created_at)
        const bTime = new Date(b.created_at)
        if (aTime < bTime) return -1
        if (aTime > bTime) return 1
        return 0
      })
    } else {
      archived = notifications.archived.filter(
        (n) => n.notification_id !== notificationId,
      )
      moved = {
        ...notifications.archived.find(
          (n) => n.notification_id === notificationId,
        )!,
        status: 'Active',
      }
      active = [moved, ...notifications.active].sort((a, b) => {
        const aTime = new Date(a.created_at)
        const bTime = new Date(b.created_at)
        if (aTime < bTime) return -1
        if (aTime > bTime) return 1
        return 0
      })
    }
    setNotifications({ active, archived })
  }
}

