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
import { EditServiceForm, Timer } from '../lib/components'
import { readableDateTime } from '../lib/utils'

import { Button, Modal, Form, Table, Card, Container, Row, Col } from 'react-bootstrap'

import ShowerGuests from '../../public/sample-data/get_slotted_shower_guests.json'

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
    const showerGuestsSlotted = ShowerGuests.filter((g) => g.slot_number !== null)

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
          <Cards>
          {
            // for every slot, display the guestSlotted or empty/available row
            // TODO: Will quota work reliably? should there be a fallback? quota ? quota : service.quota
            // TODO: change 10 back to service.quota when API live
            Array.from({ length: 10 }).map((slot, slotIndex) => {
              // if (guestsSlottedState.length !== 0 && slotIndex < guestsSlottedState.length) {
              //   const { guest_id, first_name, last_name } = guestsSlottedState[slotIndex];

              const slotNum = slotIndex + 1
              const guest = showerGuestsSlotted.find((g) => g.slot_number === slotNum)

              const slotStart = guest?.slotted_at
              const slotStatus = guest ? 'occupied' : 'available'
              let slotStatusColor = slotStatus === 'occupied' ? 'warning' : 'success'
              // if (isExpired) {
              //   slotStatusColor = 'danger'
              // }
              const slotIndicatorStyle = `bg-${slotStatusColor} rounded d-flex justify-content-center align-items-center`
              const nameAndID = `${guest?.first_name} ${guest?.last_name} (${guest?.guest_id})`;

              return (
                <Card
                  className={`border border-${slotStatusColor} border-2 mb-3 shadow`}
                  key={`${slotIndex}-${slotNum}`}
                >
                  <Card.Body className="mh-100" style={{ height: '120px'}}>
                    <Container className="h-100">
                      { guest ?
                        (
                          <Row>
                            <Col className={slotIndicatorStyle}>
                              { slotNum }
                            </Col>
                            <Col xs={7} className="d-flex flex-column justify-content-between">
                              <span>{ nameAndID }</span>
                              { service.name === 'Shower' && (
                                  <>
                                    {/* Default length of shower is 20min */}
                                    <Timer
                                      slotStart={slotStart!}
                                      slotTimeLength={20}
                                      setIsExpired={setIsExpired}
                                    >
                                    </Timer>
                                  </>
                                )
                              }
                            </Col>
                            <Col xs={4}>
                              <Button variant="outline-primary"
                                onClick={() =>
                                  // handleMoveToNewStatus(guest_id, 'Completed', null)
                                  console.log("move to Completed clicked")
                                }
                                className="mb-2"
                              >
                                Completed
                              </Button>
                              <Button variant="outline-primary"
                                onClick={() =>
                                  // handleMoveToNewStatus(guest_id, 'Queued', null)
                                  console.log("move to queued clicked")
                                }
                              >
                                Move to Queue
                              </Button>
                            </Col>
                          </Row>
                        ) : (
                          <Row className='h-100 align-items-center'>
                            <Col className={slotIndicatorStyle + ' h-100'}>
                              { slotNum }
                            </Col>
                            <Col xs={11} className="d-flex justify-content-center">
                              Available
                            </Col>
                          </Row>
                        )
                      }
                    </Container>
                  </Card.Body>
                </Card>
              )
            })
          }
          </Cards>
        </>
      ) : (
        ''
      )}
      <h2>Queue</h2>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>Time Requested</th>
            <th>Guest Name (ID)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guestsQueuedState!.map(
            ({ guest_id, first_name, last_name, created_at }, i) => {
              const nameAndID = first_name + ' ' + last_name + ` (${guest_id})`
              const timeRequested = readableDateTime(created_at)

              return (
                <tr key={`${guest_id}-${i}`}>
                  <td>{timeRequested}</td>
                  <td>{nameAndID}</td>
                  <td>
                    {service.quota ? (
                      <Form.Select
                        aria-label="Select which slot to assign"
                        onChange={(e) =>
                          handleMoveToNewStatus(
                            guest_id,
                            'Slotted',
                            parseInt(e.target.value),
                          )
                        }
                      >
                        <option>Assign Slot</option>
                        {Array.from({ length: service.quota }).map((_, i) => {
                          // TODO: need array of available slots for these options
                          return <option key={i}>{i + 1}</option>
                        })}
                      </Form.Select>
                    ) : (
                      ''
                    )}
                    <Button variant="outline-primary"
                      onClick={() =>
                        handleMoveToNewStatus(guest_id, 'Completed', null)
                      }
                    >
                      Completed
                    </Button>
                  </td>
                </tr>
              )
            },
          )}
        </tbody>
      </Table>
      <h2>Completed</h2>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>Time Requested</th>
            <th>Guest Name (ID)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guestsCompletedState!.map(
            ({ guest_id, first_name, last_name, created_at }, i) => {
              const nameAndID = first_name + ' ' + last_name + ` (${guest_id})`
              const timeRequested = readableDateTime(created_at)

              return (
                <tr key={`${guest_id}-${i}`}>
                  <td>{timeRequested}</td>
                  <td>{nameAndID}</td>
                  <td>
                    <Button variant="outline-primary"
                      onClick={() =>
                        handleMoveToNewStatus(guest_id, 'Queued', null)
                      }
                    >
                      Move to Queue
                    </Button>
                  </td>
                </tr>
              )
            },
          )}
        </tbody>
      </Table>
    </>
  )
}

function Cards({ children }) {
  return <div className="mb-5">{children}</div>
}
