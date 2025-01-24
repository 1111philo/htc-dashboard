import React, { useState } from "react";

import { Button, Modal, Form, Table } from "react-bootstrap";

import { guests } from "../../sample-data/get_guests";

const ServiceView = ({ service }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleMoveToCompleted = () => {};

  const handleMoveToQueue = () => {};

  const handleMoveToActive = () => {
    // if not slot tracking: check if number of active guests is less than service.quota
  };

  return (
    <>
      <h1>Service Name</h1>
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
      {true /* service.quota */ ? (
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
              {/* Every row (iteration: where services[i].service_name matches === shower, services.quota num of times) */}
              {
                // if guest has an active service
                //    render with guest info
                // else
                //    render with placeholders
                // service.quota - quests.length

                guests.map(
                  (
                    { guest_id, first_name, last_name, services },
                    guestIndex
                  ) => {
                    const nameAndID =
                      first_name + " " + last_name + ` (${guest_id})`;
                    const activeServices = services.filter(
                      (service) => service.status === "Active"
                    );
                    return activeServices.map((activeService, serviceIndex) => {
                      return (
                        <tr key={serviceIndex}>
                          <td>{guestIndex + 1}</td>
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
                    });
                  }
                )
              }
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>Guest Name (ID)</td>
                  <td>Status</td>
                  <td>
                    <Button onClick={handleMoveToCompleted}>
                      Move to Completed
                    </Button>
                    <Button onClick={handleMoveToQueue}>Move to Queue</Button>
                  </td>
                </tr>
              ))}
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
          {guests.map(({ guest_id, first_name, last_name, services }) => {
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
                    {true /* service.quota */ ? (
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
          {guests.map(({ guest_id, first_name, last_name, services }) => {
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
};

export default ServiceView;
