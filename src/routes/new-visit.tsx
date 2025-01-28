import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";

import { today } from "../lib/utils";
import { getGuest, getGuests } from "../lib/api/guest";

interface LoaderData {
  serviceTypes: ServiceType[];
  guestsResponse: GuestsAPIResponse;
}

export const Route = createFileRoute("/new-visit")({
  component: NewVisitView,
  loader: async ({ context }): Promise<LoaderData> => {
    const { serviceTypes } = context;
    const guestsResponse = await getGuests();
    return { serviceTypes, guestsResponse };
  },
});

function NewVisitView() {
  const { guestsResponse, serviceTypes } = Route.useLoaderData();
  const guests = guestsResponse.rows;

  const [showNewGuestModal, setShowNewGuestModal] = useState(false);

  const [selectedGuestOpt, setSelectedGuestOpt] =
    useState<ReactSelectOption | null>(null);
  const [selectedServicesOpt, setSelectedServicesOpt] = useState<
    ReactSelectOption[]
  >([]); // array bc this Select is set to multi

  const [notifications, setNotifications] = useState<GuestNotification[]>([]);

  // get notifications from selected guest
  useEffect(() => {
    if (selectedGuestOpt) {
      getGuest(+selectedGuestOpt.value).then((g) => {
        setNotifications(
          (g.guest_notifications as GuestNotification[]).filter(
            (n: GuestNotification) => n.status === "Active"
          )
        );
      });
    }
  }, [selectedGuestOpt]);

  return (
    <>
      <h1 className="mb-4">Add New Visit</h1>

      <div className="d-flex gap-3">
        <h2>Guest</h2>
        <Button variant="primary" onClick={() => setShowNewGuestModal(true)}>
          New Guest
        </Button>
      </div>

      <Modal show={showNewGuestModal}>
        <AddNewGuestForm />
      </Modal>

      <SignInGuestForm />

      <Notifications data={notifications} />

      <RequestedServices data={serviceTypes} />
    </>
  );

  function AddNewGuestForm() {
    return (
      <div className="p-3">
        <h2 className="mb-3">Add New Guest</h2>
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
            <Form.Label>Birthday</Form.Label>
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
                setShowNewGuestModal(false);
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
        setShowNewGuestModal(false);
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
      evt: React.ChangeEvent<HTMLSelectElement>,
      id: number
    ) {
      const { value: newStatus } = evt.target;
      // TODO: fetch/POST notification status change
      // TODO: on success, change the value to the updated status
      // or, update optimistically, and revert on failure, showing error message
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
      return (
        serviceTypes?.map((s: ServiceType) => ({
          value: s.service_id.toString(),
          label: s.name,
        })) ?? []
      );
    }

    function logVisit() {
      const guestId = selectedGuestOpt.value;
      const serviceIds = selectedServicesOpt.value;
      // TODO: POST
    }
  }
}
