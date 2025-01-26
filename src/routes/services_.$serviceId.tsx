import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Modal, Form, Table } from "react-bootstrap";

import mockGuests from "../../sample-data/get_guests.json";
import mockServices from "../../sample-data/get_services.json";
import mockServiceSlots from '../../sample-data/get_service_slots.json'

export const Route = createFileRoute("/services_/$serviceId")({
  component: ServiceView,
  loader: ({ params: { serviceId }}) => {
    let serviceSlots;
    // fetch service by ID
    const service = mockServices.find(({ service_id }) => service_id === parseInt(serviceId))
    if (service.quota) {
      // fetch active slots
      serviceSlots = mockServiceSlots.filter((slot) => slot.service_id === parseInt(serviceId))
    }

    return {
      service,
      serviceSlots
    }
  }
});

function ServiceView() {

  const { service, serviceSlots } = Route.useLoaderData()

  const [showEditModal, setShowEditModal] = useState(false);

  const handleMoveToCompleted = () => {};

  const handleMoveToQueue = () => {};

  const handleMoveToActive = () => {};

  return (
    <>
      <h1>{ service.service_name }s</h1>
      <Button onClick={() => setShowEditModal(true)}>Edit Service</Button>
      <Modal show={showEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="serviceName">
              <Form.Control type="email" defaultValue={"Service name"} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="serviceQuota">
              <Form.Control type="number" defaultValue={10} />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button variant="primary">Save changes</Button>
        </Modal.Footer>
      </Modal>
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
                // for every slot, check if there is a guest with a `service.slot_occupied` matching slot number
                serviceSlots.map((slot, slotIndex) => {
                  const guest = mockGuests.find((guest) =>
                    guest.guest_id === slot.guest_id
                  );

                  if (guest) {
                    const { guest_id, first_name, last_name } = guest;
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
          {mockGuests.map(({ guest_id, first_name, last_name, services }) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const queuedServices = services.filter(
              (service) => service.status === "Queued"
            );
            return queuedServices.map((queuedService, i) => {
              return (
                <tr key={i}>
                  <td>{queuedService.queued_at}</td>
                  <td>{nameAndID}</td>
                  <td>
                    {service.quota ? (
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
            });
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
          mockGuests.map(({ guest_id, first_name, last_name, services }) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const completedServices = services.filter(
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
