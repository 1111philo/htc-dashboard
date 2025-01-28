import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import * as API from 'aws-amplify/api';

import { Button, Modal, Form, Table } from "react-bootstrap";

import mockGuests from "../../sample-data/get_guests.json";
import mockServices from "../../sample-data/get_services.json";
import mockServiceSlots from '../../sample-data/get_service_slots.json';

export const Route = createFileRoute("/services_/$serviceId")({
  component: ServiceView,
  parseParams: (params): { serviceId: number } => ({
    serviceId: parseInt(params.serviceId),
  }),
  loader: async ({ params: { serviceId }}) => {
    let guestsSlotted;

    // fetch service by ID
    const serviceResponse = await (
      API.post({
        apiName: "auth",
        path: "/getServices",
        options: {
          body: {
            service_id: serviceId
          }
        }
      }).response
    )
    const [service,] = (await serviceResponse.body.json())!.rows

    if (service.quota) {
      // fetch active slotted guests
      guestsSlotted = await (
        await API.post({
          apiName: "auth",
          path: "/serviceGuestsSlotted"
        }).response
      ).body.json()
      // TODO: sort this array of guests by slot number
    }

    const guestsQueuedResponse = await (
      API.post({
        apiName: "auth",
        path: "/serviceGuestsQueued",
        options: {
          body: {
            service_id: serviceId
          }
        }
      }).response
    )
    const guestsQueued = guestsQueuedResponse.body.json().rows
    // TODO: sort this array of guests by time queued

    const guestsCompletedResponse = await (
      API.post({
        apiName: "auth",
        path: "/serviceGuestsCompleted",
        options: {
          body: {
            service_id: serviceId
          }
        }
      }).response
    )
    const guestsCompleted = guestsCompletedResponse.body.json().rows
    // TODO: sort this array of guests by time queued
    // .sort(
    //   (a, b) =>
    //     new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime()
    // )

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


  const handleMoveToCompleted = () => {};

  const handleMoveToQueue = () => {};

  const handleMoveToActive = () => {};

  return (
    <>
      <h1>{ serviceName }</h1>
      <EditServiceModal
        service={service}
        setServiceName={setServiceName}
        setQuota={setQuota}
      />
      { quota ? (
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
                Array.from({ length: quota }).map((slot, slotIndex) => {
                  if (guestsSlotted[slotIndex]) {
                    const { guest_id, first_name, last_name } = guestsSlotted[slotIndex];
                    const nameAndID = `${first_name} ${last_name} (${guest_id})`;

                    return (
                      <tr key={slotIndex}>
                        <td>{slotIndex + 1}</td>
                        <td>{nameAndID}</td>
                        <td>Occupied</td>
                        <td>
                          <Button onClick={handleMoveToCompleted}>
                            Move to Completed
                          </Button>
                          <Button onClick={handleMoveToQueue}>
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
          {
            // api staging
            // TODO: map sortedQueuedGuests to queued table
          }
          { mockGuests.map(({ guest_id, first_name, last_name, services }) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const queuedServices = JSON.parse(services).filter(
              (service) => service.status === "Queued"
            )

            return queuedServices.map((queuedService, i) => {
              return (
                <tr key={i}>
                  <td>{queuedService.queued_at}</td>
                  <td>{nameAndID}</td>
                  <td>
                    { quota ? (
                      <Form.Select aria-label="Select which slot to assign">
                        <option>Assign Slot</option>
                        {Array.from({ length: 10 }).map((_, i) => {
                          // TODO: need array of available slots for these options
                          return <option key={i}>{i + 1}</option>;
                        })}
                      </Form.Select>
                    ) : (
                      ""
                    )}
                    <Button onClick={handleMoveToCompleted}>
                      Move to Completed
                    </Button>
                  </td>
                </tr>
              );
            })
            .sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          })}
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
          {
            // api staging
            // TODO: map sortedCompletedGuests to queued table
          }
          { mockGuests.map(({ guest_id, first_name, last_name, services }) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const completedServices = JSON.parse(services).filter(
              (service) => service.status === "Completed"
            );
            return completedServices.map((completeService, i) => {
              return (
                <tr key={i}>
                  <td>{completeService.queued_at}</td>
                  <td>{nameAndID}</td>
                  <td>
                    <Button onClick={handleMoveToQueue}>Move to Queue</Button>
                  </td>
                </tr>
              );
            });
          })}
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