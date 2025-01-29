import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import * as API from 'aws-amplify/api';
import {
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  updateGuestServiceStatus
} from '../lib/api'

import { Button, Modal, Form, Table } from "react-bootstrap";

export const Route = createFileRoute("/services_/$serviceId")({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => ({
    serviceId: parseInt(params.serviceId),
  }),
  loader: async ({ params: { serviceId }}) => {
    let guestsSlotted;

    const service = await fetchServiceByID(serviceId);

    if (service.quota) {
      guestsSlotted = await fetchServiceGuestsSlotted(serviceId)
    }
    const guestsQueued = await fetchServiceGuestsQueued(serviceId)
    const guestsCompleted = await fetchServiceGuestsCompleted(serviceId)

    return {
      service,
      guestsSlotted,
      guestsQueued,
      guestsCompleted
    }
  }
});

function ServiceView() {

  const {
    service,
    guestsSlotted,
    guestsQueued,
    guestsCompleted,
  } = Route.useLoaderData()

  const [serviceName, setServiceName] = useState(service.name);
  const [quota, setQuota] = useState(service.quota);
  const [guestsSlottedState, setGuestsSlottedState] = useState(guestsSlotted)
  const [guestsQueuedState, setGuestsQueuedState] = useState(guestsQueued)
  const [guestsCompletedState, setGuestsCompletedState] = useState(guestsCompleted)

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

  return (
    <>
      <h1>{ service.name }</h1>
      <EditServiceModal
        service={service}
        serviceName={serviceName}
        setServiceName={setServiceName}
        quota={quota}
        setQuota={setQuota}
      />
      { service.quota ? (
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

function EditServiceModal({
  service,
  serviceName,
  setServiceName,
  quota,
  setQuota
}) {

  const [show, setShow] = useState(false);
  const [newServiceName, setNewServiceName] = useState<String>("");
  const [newQuota, setNewQuota] = useState<Number>();

  const handleClose = () => setShow(false)

  const handleSaveService = async () => {

    const updateResponse = await (
      await API.post({
        apiName: "auth",
        path: "/updateService",
        options: {
          body: {
            name: newServiceName,
            quota: newQuota,
            service_id: service.service_id
          }
        }
      }).response
    ).statusCode

    if (updateResponse === 200) {
      setQuota(newQuota);
      setServiceName(newServiceName);
      handleClose();
    }
  }

  return (
    <>
      <Button onClick={() => setShow(true)}>Edit Service</Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="serviceName">
              <Form.Control
                type="email"
                defaultValue={serviceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="New Service Name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceQuota">
              <Form.Control
                type="number"
                defaultValue={quota ?? 0}
                onChange={(e) => setNewQuota(parseInt(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveService}
          >
            Save changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}