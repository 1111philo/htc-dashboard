import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { FeedbackMessage } from "../lib/components/FeedbackMessage";

import {
  getGuest,
  getGuests,
  getGuestsWithQueryDebounced,
} from "../lib/api/guest";
import NewGuestForm from "../lib/components/NewGuestForm";
import { addVisit } from "../lib/api/visit";

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
  const [guestSelectOpts, setGuestSelectOpts] = useState<
    { value: string; label: string }[]
  >([]);
  const [searchText, setSearchInput] = useState("");

  // debounced guests query
  useEffect(() => {
    if (!searchText) {
      setGuestSelectOpts([])
      // TODO: do something here?
      return;
    }
    getGuestsWithQueryDebounced(searchText.trim())
    .then(guestsResponse => {
      setGuestSelectOpts(guestLookupOpts(guestsResponse.rows));
    });
    guestSelectRef.current?.focus();
  }, [searchText]);

  useEffect(() => {
    guestSelectRef.current?.focus();
  }, [guestSelectOpts]); // Only re-focus when options change

  const [notifications, setNotifications] = useState<GuestNotification[]>([]);

  const guestSelectRef = useRef(null);

  // set selected guest to new guest if exists
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

      <FeedbackMessage
        text={feedback.text}
        isError={feedback.isError}
        className="my-3"
      />

      <Modal show={showNewGuestModal}>
        <NewGuestForm
          setShowNewGuestModal={setShowNewGuestModal}
          setNewGuest={setNewGuest}
          setViewFeedback={setFeedback}
        />
      </Modal>

      <SignInGuestForm />

      <Notifications data={notifications} />

      <RequestedServices data={serviceTypes} />
    </>
  );

  function SignInGuestForm() {
    return (
      <Form className="mt-3 my-5">
        <Form.Group className="mb-3" controlId="formUID">
          <Form.Label>
            <i>Search by UID, Name, or Birthday (YYYY/MM/DD):</i>
          </Form.Label>
          <Select
            id="user-dropdown"
            ref={guestSelectRef}
            options={
              newGuest
                ? [{ value: newGuest.guest_id, label: guestOptLabel(newGuest) }]
                : guestSelectOpts
            }
            defaultValue={selectedGuestOpt}
            defaultInputValue={searchText}
            value={selectedGuestOpt}
            onChange={(newVal) => setSelectedGuestOpt(newVal)}
            onInputChange={(value) => setSearchInput(value)}
            menuIsOpen={!!searchText}
            placeholder={"Search for a guest..."}
          />
        </Form.Group>
      </Form>
    );
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

    async function logVisit(e) {
      e.preventDefault();
      // TODO validate "form"
      const v: Partial<Visit> = {
        guest_id: +selectedGuestOpt!.value,
        service_ids: selectedServicesOpt.map(({ value }) => +value),
      };
      const visitId = await addVisit(v);
      if (!visitId) {
        setFeedback({
          text: "Failed to create the visit. Try again in a few.",
          isError: true,
        });
        return;
      }
      setShowNewGuestModal(false);
      setFeedback({
        text: `Visit created successfully! ID: ${visitId}`,
        isError: false,
      });
      clearInputs();
    }
  }

  /** Map guests to `Select` options */
  function guestLookupOpts(guests: Guest[]): ReactSelectOption[] {
    return guests.map((g) => {
      return {
        value: g.guest_id.toString(),
        label: guestOptLabel(g),
      };
    });
  }

  function guestOptLabel(g) {
    return `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`;
  }

  function clearInputs() {
    setSelectedGuestOpt(null);
    setSelectedServicesOpt([]);
  }
}
