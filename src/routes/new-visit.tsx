import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { FeedbackMessage } from "../lib/components/FeedbackMessage";

import { today } from "../lib/utils";
import { addGuest, getGuest, getGuests } from "../lib/api/guest";

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

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  const [showNewGuestModal, setShowNewGuestModal] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest> | null>(null);

  const [selectedGuestOpt, setSelectedGuestOpt] =
    useState<ReactSelectOption | null>(null);
  const [selectedServicesOpt, setSelectedServicesOpt] = useState<
    ReactSelectOption[]
  >([]); // array bc this Select is set to multi

  const [notifications, setNotifications] = useState<GuestNotification[]>([]);

  // set selected guest when new guest if exists
  useEffect(() => {
    if (!newGuest) return;
    setSelectedGuestOpt({
      value: newGuest.guest_id?.toString()!,
      label: guestOptLabel(newGuest),
    });
  }, [newGuest]);

  // get notifications from selected guest
  useEffect(() => {
    if (selectedGuestOpt) {
      getGuest(+selectedGuestOpt.value).then((g) => {
        if (!g.guest_notifications) return; // new guest is partial, no notifications key
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

      <FeedbackMessage text={feedback.text} isError={feedback.isError} />

      <Modal show={showNewGuestModal}>
        <AddNewGuestForm />
      </Modal>

      <SignInGuestForm />

      <Notifications data={notifications} />

      <RequestedServices data={serviceTypes} />
    </>
  );

  function AddNewGuestForm() {
    const [formFeedback, setFormFeedback] = useState<UserMessage>({
      text: "",
      isError: false,
    });
    return (
      <div className="p-3">
        <h2 className="mb-3">Add New Guest</h2>
        <FeedbackMessage
          text={formFeedback.text}
          isError={formFeedback.isError}
        />
        <Form onSubmit={submitNewGuestForm}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control id="input-first-name" name="first_name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control id="input-last-name" name="last_name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birthday</Form.Label>
            <Form.Control
              id="input-dob"
              name="dob"
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

    // TODO: require at least 2 fields!
    async function submitNewGuestForm(e: SubmitEvent) {
      e.preventDefault();
      const guest: Partial<Guest> = Object.fromEntries(new FormData(e.target));
      const guest_id = await addGuest(guest);
      if (!guest_id) {
        setFormFeedback({
          text: "Failed to create guest. Try again in a few.",
          isError: true,
        });
        return;
      }
      setShowNewGuestModal(false);
      setFeedback({
        text: `Guest created successfully! ID: ${guest_id}`,
        isError: false,
      });
      setNewGuest({ ...guest, guest_id });
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
            options={
              newGuest
                ? [
                    {
                      value: newGuest.guest_id,
                      label: guestOptLabel(newGuest),
                    },
                    ...guestLookupOpts(guests),
                  ]
                : guestLookupOpts(guests)
            }
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
          label: guestOptLabel(g),
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

  function guestOptLabel(g) {
    return `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`;
  }
}
