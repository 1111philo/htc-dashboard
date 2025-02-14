import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import {
  FeedbackMessage,
  NewGuestForm,
  GuestSelectSearch,
} from "../lib/components";
import { addGuest, getGuestData, getGuestsWithQuery } from "../lib/api/guest";
import { addVisit } from "../lib/api/visit";
import { toggleGuestNotificationStatus } from "../lib/api/notification";
import { guestOptLabel, readableDateTime, trimStringValues } from "../lib/utils";

interface LoaderData {
  serviceTypes: ServiceType[];
}

export const Route = createFileRoute("/_auth/new-visit")({
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

  // get notifications from selected guest
  useEffect(() => {
    if (!selectedGuestOpt) return;
    getGuestData(+selectedGuestOpt.value).then((g) => {
      if (!g.guest_notifications) return; // new guest is partial, so no notifications key
      setNotifications(
        (g.guest_notifications as GuestNotification[]).filter(
          (n: GuestNotification) => n.status === "Active"
        )
      );
    });
  }, [selectedGuestOpt]);

  return (
    <>
      <h1 className="mb-4">Add New Visit</h1>

      <div className="d-flex gap-3 justify-content-between">
        <h2>Guest</h2>
        <Button variant="primary" onClick={() => setShowNewGuestModal(true)}>
          New Guest
        </Button>
      </div>

      <FeedbackMessage message={feedback} className="my-3" />

      <Modal show={showNewGuestModal}>
        <NewGuestForm
          onSubmit={onSubmitNewGuestForm}
          onClose={onCloseNewGuestForm}
        />
      </Modal>

      <GuestSelectSearch
        newGuest={newGuest}
        selectedGuestOpt={selectedGuestOpt}
        setSelectedGuestOpt={setSelectedGuestOpt}
      />

      {!!notifications.length && <Notifications data={notifications} />}

      <RequestedServices data={serviceTypes} />
    </>
  );

  async function onSubmitNewGuestForm(
    guest: Partial<Guest>
  ): Promise<number | null> {
    trimStringValues(guest)
    const guest_id = await addGuest(guest);
    if (!guest_id) return null;
    setShowNewGuestModal(false);
    setFeedback({
      text: `Guest created successfully! ID: ${guest_id}`,
      isError: false,
    });
    const newGuest: Partial<Guest> = { ...guest, guest_id };
    setNewGuest(newGuest);
    return guest_id;
  }

  function onCloseNewGuestForm() {
    if (!confirm("Discard the new guest?")) return;
    setShowNewGuestModal(false);
  }

  function Notifications({ data }) {
    return (
      <div className="pb-5">
        <h2>Notifications ({notifications.length})</h2>
        <Table>
          <tbody>
            {notifications.map((n: GuestNotification) => {
              const [date, time] = readableDateTime(n.created_at).split(" ");
              return (
                <tr key={n.notification_id} className="align-middle">
                  <td>
                    {date} <br /> {time}
                  </td>
                  <td>{n.message}</td>
                  <td>
                    <Form.Select
                      onChange={async () =>
                        await updateNotificationStatus(
                          n.notification_id,
                          n.status
                        )
                      }
                      style={{ minWidth: "11ch" }}
                      data-notification-id={n.notification_id}
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

    async function updateNotificationStatus(
      notificationId: number,
      status: GuestNotificationStatus
    ) {
      const success = await toggleGuestNotificationStatus(notificationId);
      if (success) return;
      // unsuccessful -> revert value
      const notificationSelect = document.querySelector(
        `[data-notification-id="${notificationId}"]`
      ) as HTMLSelectElement | null;
      notificationSelect!.value = status;
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
          disabled={!selectedServicesOpt.length}
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
      if (!selectedServicesOpt.length) return;
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
      clear();
    }
  }

  function clear() {
    setSelectedGuestOpt(null);
    setSelectedServicesOpt([]);
    setNotifications([]);
  }
}
