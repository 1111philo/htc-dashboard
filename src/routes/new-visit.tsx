import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import FeedbackMessage from "../lib/components/FeedbackMessage";

import {
  addGuest,
  getGuestData,
  getGuestsWithQueryDebounced,
} from "../lib/api/guest";
import NewGuestForm from "../lib/components/NewGuestForm";
import { addVisit } from "../lib/api/visit";

interface LoaderData {
  serviceTypes: ServiceType[];
}

export const Route = createFileRoute("/new-visit")({
  component: NewVisitView,
  loader: async ({ context }): Promise<LoaderData> => {
    let { serviceTypes } = context;
    serviceTypes = serviceTypes ?? [];
    return { serviceTypes };
  },
});

function NewVisitView() {
  const { serviceTypes } = Route.useLoaderData();

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

  // set selected guest to new guest if exists
  useEffect(() => {
    if (!newGuest) return;
    setSelectedGuestOpt({
      value: newGuest.guest_id?.toString()!,
      label: guestOptLabel(newGuest),
    });
  }, [newGuest]);

  // // get notifications from selected guest
  // useEffect(() => {
  //   if (selectedGuestOpt) {
  //     getGuestData(+selectedGuestOpt.value).then((g) => {
  //       if (!g.guest_notifications) return; // new guest is partial, no notifications key
  //       setNotifications(
  //         (g.guest_notifications as GuestNotification[]).filter(
  //           (n: GuestNotification) => n.status === "Active"
  //         )
  //       );
  //     });
  //   }
  // }, [selectedGuestOpt]);

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
          setViewFeedback={setFeedback}
          onSubmit={onSubmitNewGuestForm}
        />
      </Modal>

      <SignInGuestForm
        newGuest={newGuest}
        selectedGuestOpt={selectedGuestOpt}
        setSelectedGuestOpt={setSelectedGuestOpt}
      />

      <Notifications data={notifications} />

      <RequestedServices data={serviceTypes} />
    </>
  );

  // TODO: require at least 2 fields!
  async function onSubmitNewGuestForm(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<number | null> {
    e.preventDefault();
    const guest: Partial<Guest> = Object.fromEntries(new FormData(e.target));
    const guest_id = await addGuest(guest);
    if (!guest_id) return null;
    setShowNewGuestModal(false);
    setFeedback &&
      setFeedback({
        text: `Guest created successfully! ID: ${guest_id}`,
        isError: false,
      });
    const newGuest: Partial<Guest> = { ...guest, guest_id };
    setNewGuest(newGuest)
    return guest_id;
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

  function clearInputs() {
    setSelectedGuestOpt(null);
    setSelectedServicesOpt([]);
  }
}

function SignInGuestForm({ newGuest, selectedGuestOpt, setSelectedGuestOpt }) {
  const [guestSelectOpts, setGuestSelectOpts] = useState<
    { value: string; label: string }[]
  >([]);

  const [searchText, setSearchInput] = useState("");

  // TODO: move me to onChange handler
  // debounce guests query and update search results on search change
  useEffect(() => {
    if (!searchText) {
      setGuestSelectOpts([]);
      // TODO: do something here?
      return;
    }
    getGuestsWithQueryDebounced(searchText.trim()).then((guestsResponse) => {
      setGuestSelectOpts(guestLookupOpts(guestsResponse.rows));
    });
  }, [searchText]);

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

function guestOptLabel(g: Guest) {
  return `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`;
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
