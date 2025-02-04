import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import {
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  fetchServices,
  updateGuestServiceStatus,
} from '../lib/api'
import {
  AvailableSlotCard,
  CompletedTable,
  EditServiceForm,
  OccupiedSlotCard,
  QueuedTable
} from '../lib/components'

import { Button, Modal } from 'react-bootstrap'

import ShowerGuests from '../../sample-data/get_slotted_shower_guests.json'

export const Route = createFileRoute('/_auth/services_/$serviceId')({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => ({
    serviceId: parseInt(params.serviceId),
  }),
  loader: async ({ context, params: { serviceId } }) => {
    let guestsSlotted

    const services = await fetchServices()
    const service = await fetchServiceByID(serviceId)
    if (service.quota) {
      // guestsSlotted = await fetchServiceGuestsSlotted(serviceId)
    }
    const guestsQueued = await fetchServiceGuestsQueued(serviceId)
    const guestsCompleted = await fetchServiceGuestsCompleted(serviceId)

    const authUserIsAdmin = context.authUserIsAdmin ?? false

    // filter for guests with shower slot
    const showerGuestsSlotted: GuestSlottedResponse[] = ShowerGuests.filter((g) => g.slot_number !== null)

    return {
      authUserIsAdmin,
      service,
      services,
      guestsSlotted,
      guestsQueued,
      guestsCompleted,
      showerGuestsSlotted
    }
  },
})

function ServiceView() {
  const {
    authUserIsAdmin,
    service,
    services,
    guestsSlotted,
    guestsQueued,
    guestsCompleted,
    showerGuestsSlotted
  } = Route.useLoaderData()

  const [guestsSlottedState, setGuestsSlottedState] = useState(guestsSlotted)
  const [guestsQueuedState, setGuestsQueuedState] = useState(guestsQueued)
  const [guestsCompletedState, setGuestsCompletedState] =
    useState(guestsCompleted)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  const handleMoveToNewStatus = async (
    guestId: number,
    newStatus: string,
    slotNum: number | null,
  ) => {
    updateGuestServiceStatus(service, newStatus, guestId, slotNum)
    if (service.quota) {
      // setGuestsSlottedState(await fetchServiceGuestsSlotted(service.service_id))
    }
    setGuestsQueuedState(await fetchServiceGuestsQueued(service.service_id))
    setGuestsCompletedState(
      await fetchServiceGuestsCompleted(service.service_id),
    )
  }

  const occupiedSlots: number[] = [3, 5, 7]

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className='mb-0'>{ service.name }</h1>
        <span>**Slots simulated until /serviceGuestsSlotted is stable**</span>
        { authUserIsAdmin &&
          (<Button onClick={() => setShowEditServiceModal(true)}
          >
            Edit Service
          </Button>
        )}
      </div>

      <Modal show={showEditServiceModal}>
        <EditServiceForm
          service={service}
          services={services}
          setShowEditServiceModal={setShowEditServiceModal}
        />
      </Modal>

      { service.quota ? (
        <>
          <h2>Slots</h2>
          <ServiceSlotCards>
          {
            // for every slot, display the guestSlotted or empty/available row
            // TODO: Will quota work reliably? should there be a fallback? quota ? quota : service.quota
            // TODO: change 10 back to service.quota when API live
            Array.from({ length: 10 }).map((slot, slotIndex) => {
              // if (guestsSlottedState.length !== 0 && slotIndex < guestsSlottedState.length) {
              //   const { guest_id, first_name, last_name } = guestsSlottedState[slotIndex];

              const slotNum = slotIndex + 1
              const guest = showerGuestsSlotted.find((g) => g.slot_number === slotNum)

              if (guest) {
                return (
                  <OccupiedSlotCard
                    guest={guest}
                    serviceName={service.name}
                    slotNum={slotNum}
                    key={`${slotIndex}-${slotNum}`}
                  >
                  </OccupiedSlotCard>
                )
              } else {
                return (
                  <AvailableSlotCard
                    slotNum={slotNum}
                    key={`${slotIndex}-${slotNum}`}
                  />
                )
              }
            })
          }
          </ServiceSlotCards>
        </>
      ) : (
        ''
      )}

      <h2>Queue</h2>
      <QueuedTable
        guestsQueued={guestsQueuedState}
        occupiedSlots={occupiedSlots}
        service={service}
      />

      <h2>Completed</h2>
      <CompletedTable
        guestsCompleted={guestsCompletedState}
        service={service}
      />
    </>
  )
}

function ServiceSlotCards({ children }) {
  return <div className="mb-5">{children}</div>
}
