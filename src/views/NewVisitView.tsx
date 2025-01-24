import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import Select from "react-select";

import mockGuests from "../../sample-data/get_guests.json";
import mockServices from "../../sample-data/get_services.json";

export default function NewVisitView() {
  const [showAddNewGuest, setShowAddNewGuest] = useState(false);
  const [selectedGuestOpt, setSelectedGuestOpt] = useState<ReactSelectOption>(null);
  const [selectedServicesOpt, setSelectedServicesOpt] = useState<ReactSelectOption[]>([]); // array bc this Select is set to multi

  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [notifications, setNotifications] = useState<GuestNotification[]>([]);
  const [services, setServices] = useState<GuestService[]>(mockServices);

  // derive guest's notifications from selected guest
  useEffect(() => {
    if (selectedGuestOpt) {
      const guest = guests.find((g) => g.guest_id === parseInt(selectedGuestOpt.value));
      setNotifications(
        JSON.parse(guest.notifications as string).filter(
          (n: GuestNotification) => n.status === "Active"
        )
      );
    }
  }, [selectedGuestOpt]);

  return (
    <>
      <h1 className="mb-4">Add New Visit</h1>

      {/* TODO: on add new guest, add the new guest to `guests` and fill in the guest Select */}
      <div className="d-flex gap-3">
        <h2>Guest</h2>
        <Button variant="primary" onClick={() => setShowAddNewGuest(true)}>
          New Guest
        </Button>
      </div>

      <Modal show={showAddNewGuest}>
        <AddNewGuestForm />
      </Modal>

      <SignInGuestForm />

      <Notifications data={notifications} />

      <RequestedServices data={services} />
    </>
  );

  function AddNewGuestForm() {
    return (
      <div className="p-3">
        <h2 className="pb-3">Add New Guest</h2>
        <Form onSubmit={submitNewGuestForm}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birthday (YYYY/MM/DD)</Form.Label>
            <Form.Control
              type="date"
              min="1911-11-11" // ✨
              max={today()}
            />
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button
              variant="danger"
              type="button"
              onClick={() => {
                setShowAddNewGuest(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>
    );

    function submitNewGuestForm(evt: SubmitEvent) {
      evt.preventDefault();

      // TODO: fetch/POST new guest

      const { success } = { success: true }; // placeholder
      if (success) {
        setShowAddNewGuest(false);
        // TODO: report success with a toast (or anything, for now)
      }
    }
  }

  function SignInGuestForm() {
    return (
      <Form className="mt-3 my-5">
        <Form.Group className="mb-3" controlId="formUID">
          <Form.Label>
            <i>Search by UID, Name, or Birthday (YYYY/MM/DD):</i>
          </Form.Label>
          <Select
            id="user-dropdown"
            options={guestLookupOpts(guests)}
            value={selectedGuestOpt}
            onChange={(newVal) => setSelectedGuestOpt(newVal)}
          />
        </Form.Group>
      </Form>
    );

    /** Map guests to `Select` options */
    function guestLookupOpts(guests: Guest[]) {
      return guests.map((g) => {
        return {
          value: g.guest_id,
          label: `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`,
        };
      });
    }
  }

  function Notifications({ data }) {
    return (
      <div className="pb-5">
        <h2>Notifications ({notifications.length})</h2>
        <Table>
          <tbody>
            {notifications.map((n: GuestNotification) => {
              return (
                <tr key={n.notification_id}>
                  <td>{n.updated_at}</td>
                  <td>{n.message}</td>
                  <td>
                    <Form.Select
                      value={n.status}
                      onChange={(evt) =>
                        updateNotificationStatus(evt, n.notification_id)
                      }
                      style={{ minWidth: "11ch" }}
                    >
                      <option value="Active">ACTIVE</option>
                      <option value="Archived">Archive</option>
                    </Form.Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );

    function updateNotificationStatus(
      evt: ChangeEvent<HTMLSelectElement>,
      id: number
    ) {
      const { value: newStatus } = evt.target;
      // TODO: fetch/POST notification status change
      // TODO: on success, change the value to the updated status
      const { success } = { success: true }; // placeholder
      if (success) {
        // TODO: Instead of removing the item from the notifications list, leave it
        // and treat it as a form field in a form that gets submitted by clicking the
        // Log Visit button. ADD THIS TO logVisit()!
      }
    }
  }

  function RequestedServices({ data }) {
    return (
      <div>
        <h2>Requested Services</h2>
        <p>
          <i>Select at least 1</i>
        </p>
        <Select
          isMulti
          options={servicesOpts()}
          value={selectedServicesOpt}
          onChange={(newVal: []) => {
            console.log("SELECTED SERVICES:", newVal);
            setSelectedServicesOpt(newVal);
          }}
        />
        <Button
          type="submit"
          onClick={logVisit}
          className="mt-4 d-block m-auto"
        >
          Log Visit
        </Button>
      </div>
    );

    /** Map services to `Select` options */
    function servicesOpts() {
      return services.map((s: GuestService) => ({
        value: s.service_id.toString(),
        label: s.service_name,
      }));
    }

    function logVisit() {
      const guestId = selectedGuestOpt.value;
      const serviceIds = selectedServicesOpt.value;
      // TODO: POST
    }
  }
}

// UTIL
/** Return today's date in YYYY/MM/DD format. */
function today(): string {
  return new Date().toISOString().split("T")[0];
}
