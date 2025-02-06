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

export const Route = createFileRoute('/_auth/services_/$serviceId')({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => ({
    serviceId: parseInt(params.serviceId),
  }),
  beforeLoad: async ({ params: { serviceId }}) => {
    const service = await fetchServiceByID(serviceId)
    return { service }
  },
  loader: async ({ context: { service, authUserIsAdmin }, params: { serviceId } }) => {
    let guestsSlotted;
    let availableSlots;
    const totalSlots = Array.from({ length: service.quota }, (_, i) => i + 1);

    const services = await fetchServices()
    if (service.quota) {
      guestsSlotted = await fetchServiceGuestsSlotted(serviceId)
      const occupiedSlots = guestsSlotted.map((g) => g.slot_id)
      availableSlots = totalSlots.reduce((accum: number[], curr: number, i) => {
        if (!occupiedSlots.includes(curr)) {
          accum.push(curr)
        }
        return accum
      }, [])
    }
    const guestsQueued = await fetchServiceGuestsQueued(serviceId)
    const guestsCompleted = await fetchServiceGuestsCompleted(serviceId)


    return {
      authUserIsAdmin,
      service,
      services,
      guestsSlotted,
      guestsQueued,
      guestsCompleted,
      availableSlots,
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
    availableSlots,
  } = Route.useLoaderData()

  const [guestsSlottedState, setGuestsSlottedState] = useState(guestsSlotted)
  const [guestsQueuedState, setGuestsQueuedState] = useState(guestsQueued)
  const [guestsCompletedState, setGuestsCompletedState] = useState(guestsCompleted)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [availableSlotsState, setAvailableSlotsState] = useState<number[]>(availableSlots)

  const handleMoveToNewStatus = async (
    guestId: number,
    newStatus: string,
    slotNum: number | null,
  ) => {
    updateGuestServiceStatus(service, newStatus, guestId, slotNum)
    if (service.quota) {
      setGuestsSlottedState(await fetchServiceGuestsSlotted(service.service_id))
    }
    setGuestsQueuedState(await fetchServiceGuestsQueued(service.service_id))
    setGuestsCompletedState(
      await fetchServiceGuestsCompleted(service.service_id),
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className='mb-0'>{ service.name }</h1>
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
            Array.from({ length: service.quota }).map((slot, slotIndex) => {
              const slotNum = slotIndex + 1
              const guest = guestsSlottedState.find((g) => g.slot_id === slotNum)

              if (guest) {
                return (
                  <OccupiedSlotCard
                    guest={guest}
                    serviceName={service.name}
                    slotNum={slotNum}
                    key={`${slotIndex}-${slotNum}`}
                  />
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
        availableSlots={availableSlotsState}
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
