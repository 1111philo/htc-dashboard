import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  fetchServices,
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
    let totalSlots;

    const services = await fetchServices()
    if (service.quota) {
      totalSlots = Array.from({ length: service.quota }, (_, i) => i + 1);
      guestsSlotted = await fetchServiceGuestsSlotted(serviceId)
      const occupiedSlots = guestsSlotted.map((g) => g.slot_id)
      availableSlots = totalSlots.reduce((accum: number[], curr: number, i) => {
        if (!occupiedSlots.includes(curr)) {
          accum.push(curr)
        }
        return accum
      }, [])
    }

    return {
      authUserIsAdmin,
      service,
      services,
      availableSlots,
    }
  },
})

function ServiceView() {
  const {
    authUserIsAdmin,
    service,
    services,
    availableSlots,
  } = Route.useLoaderData()
  const queryClient = useQueryClient();

  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [availableSlotsState, setAvailableSlotsState] = useState<number[]>(availableSlots)

  const { data: guestsSlotted, isPending: isSlotsPending } = useQuery({
    queryFn: () => fetchServiceGuestsSlotted(service.service_id),
    queryKey: ["guestsSlotted"],
    enabled: !!service.quota
  });
  const { data: guestsQueued, isPending: isQueuedPending } = useQuery({
    queryFn: () => fetchServiceGuestsQueued(service.service_id),
    queryKey: ["guestsQueued"]
  });
  const { data: guestsCompleted, isPending: isCompletedPending } = useQuery({
    queryFn: () => fetchServiceGuestsCompleted(service.service_id),
    queryKey: ["guestsCompleted"]
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className='mb-0'>{ service.name }</h1>
        { authUserIsAdmin &&
          (
            <Button
              variant="outline-primary"
              onClick={() => setShowEditServiceModal(true)}
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
          { isSlotsPending ? (
            <p>Loading...</p>
          ) : (
            <ServiceSlotCards>
            {
              // for every slot, display the guestSlotted or empty/available row
              Array.from({ length: service.quota }).map((slot, slotIndex) => {
                const slotNum = slotIndex + 1
                const guest = guestsSlotted?.find((g) => g.slot_id === slotNum)

                if (guest) {
                  return (
                    <OccupiedSlotCard
                      guest={guest}
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
          )
          }
        </>
      ) : (
        ''
      )}

      <h2>Queue</h2>
      { isQueuedPending ? (
        <p>Loading...</p>
      ) : (
        <QueuedTable
          guestsQueued={guestsQueued}
          availableSlots={availableSlotsState}
          service={service}
        />
      )}

      <h2>Completed</h2>
      { isCompletedPending ? (
        <p>Loading...</p>
      ) : (
        <CompletedTable
          guestsCompleted={guestsCompleted}
        />
      )}
    </>
  )
}

function ServiceSlotCards({ children }) {
  return <div className="mb-5">{children}</div>
}
