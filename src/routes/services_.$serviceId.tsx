import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import {
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  fetchServices,
  updateGuestServiceStatus
} from '../lib/api'

import { Button, Modal, Form, Table } from "react-bootstrap";
import EditServiceForm from "../lib/components/EditServiceForm";

export const Route = createFileRoute("/services_/$serviceId")({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => ({
    serviceId: parseInt(params.serviceId),
  }),
  loader: async ({ params: { serviceId }}) => {
    let guestsSlotted;

    const services = await fetchServices();
    const service = await fetchServiceByID(serviceId);

    if (service.quota) {
      guestsSlotted = await fetchServiceGuestsSlotted(serviceId)
    }
    const guestsQueued = await fetchServiceGuestsQueued(serviceId)
    const guestsCompleted = await fetchServiceGuestsCompleted(serviceId)

    return {
      service,
      services,
      guestsSlotted,
      guestsQueued,
      guestsCompleted
    }
  }
});

function ServiceView() {

  const {
    service,
    services,
    guestsSlotted,
    guestsQueued,
    guestsCompleted,
  } = Route.useLoaderData()

  const [serviceName, setServiceName] = useState<String>(service.name);
  const [quota, setQuota] = useState<Number | null>(service.quota);
  const [guestsSlottedState, setGuestsSlottedState] = useState(guestsSlotted)
  const [guestsQueuedState, setGuestsQueuedState] = useState(guestsQueued)
  const [guestsCompletedState, setGuestsCompletedState] = useState(guestsCompleted)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)

  const handleMoveToNewStatus = async (
    guestId: number,
    newStatus: string,
    slotNum: number | null
  ) => {
    updateGuestServiceStatus(
      service,
      newStatus,
      guestId,
      slotNum
    )
    if (service.quota) {
      setGuestsSlottedState(await fetchServiceGuestsSlotted(service.service_id));
    }
    setGuestsQueuedState(await fetchServiceGuestsQueued(service.service_id));
    setGuestsCompletedState(await fetchServiceGuestsCompleted(service.service_id));
  };

  const updateServiceName = (newName: String) => setServiceName(newName)
  const updateQuota = (newQuota: Number | null) => setQuota(newQuota)

  return (
    <>
      <h1>{ serviceName }</h1>
      <Button onClick={() => setShowEditServiceModal(true)}
      >
        Edit Service
      </Button>

      <Modal show={showEditServiceModal}>
        <EditServiceForm
          service={service}
          services={services}
          updateServiceName={updateServiceName}
          updateQuota={updateQuota}
          setShowEditServiceModal={setShowEditServiceModal}
        />
      </Modal>

        <>
          <h2>Slots</h2>
          <Table responsive={true}>
            <thead>
              <tr>
                <th>Slot #</th>
                <th>Guest Name (ID)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                // for every slot, display the guestSlotted or empty/available row
                Array.from({ length: service.quota }).map((slot, slotIndex) => {
                  if (guestsSlottedState.length !== 0 && slotIndex < guestsSlottedState.length) {
                    const { guest_id, first_name, last_name } = guestsSlottedState[slotIndex];
                    const nameAndID = `${first_name} ${last_name} (${guest_id})`;

                    return (
                      <tr key={slotIndex}>
                        <td>{slotIndex + 1}</td>
                        <td>{nameAndID}</td>
                        <td>Occupied</td>
                        <td>
                          <Button onClick={() => handleMoveToNewStatus(guest_id, "Completed", null)}>
                            Move to Completed
                          </Button>
                          <Button onClick={() => handleMoveToNewStatus(guest_id, "Queued", null)}>
                            Move to Queue
                          </Button>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={slotIndex}>
                        <td>{slotIndex + 1}</td>
                        <td>Empty</td>
                        <td>Available</td>
                        <td></td>
                      </tr>
                    );
                  }
                })
              }
            </tbody>
          </Table>
        </>
      ) : (
        ""
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
          { guestsQueuedState!.map(({ guest_id, first_name, last_name, created_at }, i) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;

              return (
                <tr key={`${guest_id}-${i}`}>
                  <td>{created_at}</td>
                  <td>{nameAndID}</td>
                  <td>
                    { service.quota ? (
                      <Form.Select
                        aria-label="Select which slot to assign"
                        onChange={(e) => handleMoveToNewStatus(guest_id, "Slotted", parseInt(e.target.value))}
                      >
                        <option>Assign Slot</option>
                        {Array.from({ length: service.quota }).map((_, i) => {
                          // TODO: need array of available slots for these options
                          return <option key={i}>{i + 1}</option>;
                        })}
                      </Form.Select>
                    ) : (
                      ""
                    )}
                    <Button onClick={() => handleMoveToNewStatus(guest_id, "Completed", null)}>
                      Move to Completed
                    </Button>
                  </td>
                </tr>
              );
            })
          }
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
          { guestsCompletedState!.map(({ guest_id, first_name, last_name, created_at }, i) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;

              return (
                <tr key={`${guest_id}-${i}`}>
                  <td>{created_at}</td>
                  <td>{nameAndID}</td>
                  <td>
                    <Button onClick={() => handleMoveToNewStatus(guest_id, "Queued", null)}>Move to Queue</Button>
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </Table>
    </>
  );
}
