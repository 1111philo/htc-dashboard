import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Select from "react-select";
import { Button, Form, Modal, Table } from "react-bootstrap";
import {
  FeedbackMessage,
  NewGuestForm,
  GuestSelectSearch,
} from "../lib/components";
import { addGuest, getGuestData } from "../lib/api/guest";
import { addVisit } from "../lib/api/visit";
import { toggleGuestNotificationStatus } from "../lib/api/notification";
import { readableDateTime, trimStringValues } from "../lib/utils";

const DEFAULT_SERVICE_NAME = "courtyard";

interface LoaderData {
  serviceTypes: ServiceType[];
  defaultService: ServiceType | null;
}

export const Route = createFileRoute("/_auth/new-visit")({
  component: NewVisitView,
  loader: async ({ context }): Promise<LoaderData> => {
    let { serviceTypes } = context;
    serviceTypes = serviceTypes ?? [];
    const defaultService =
      serviceTypes.find((s) => s.name.toLowerCase() === DEFAULT_SERVICE_NAME) ??
      null;
    return { serviceTypes, defaultService };
  },
});

function NewVisitView() {
  const { serviceTypes, defaultService } = Route.useLoaderData();

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  const [showNewGuestModal, setShowNewGuestModal] = useState(false);

  const [selectedGuest, setSelectedGuest] = useState<
    Guest | Partial<Guest> | null
  >(null);

  const [notifications, setNotifications] = useState<GuestNotification[]>([]);

  const [selectedServicesOpts, setSelectedServicesOpts] = useState<
    ReactSelectOption[]
  >(defaultService ? [serviceTypeOptionFrom(defaultService)] : []); // array bc this Select is set to multi

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

      <div className="mb-5">
        <GuestSelectSearch
          selectedGuest={selectedGuest}
          onSelect={onSelectGuest}
        />
      </div>

      {!!notifications.length && (
        <Notifications notifications={notifications} />
      )}

      <RequestedServices
        serviceTypes={serviceTypes}
        selectedServicesOpts={selectedServicesOpts}
        setSelectedServicesOpts={setSelectedServicesOpts}
        selectedGuest={selectedGuest}
        setShowNewGuestModal={setShowNewGuestModal}
        setFeedback={setFeedback}
        clear={clear}
      />
    </>
  );

  async function onSelectGuest(guest: Guest) {
    setSelectedGuest(guest);
    const { guest_notifications } = await getGuestData(guest.guest_id);
    if (!guest_notifications) return;
    setNotifications(guest_notifications.filter((n) => n.status === "Active"));
  }

  async function onSubmitNewGuestForm(
    guest: Partial<Guest>
  ): Promise<number | null> {
    trimStringValues(guest);
    const guest_id = await addGuest(guest);
    if (!guest_id) return null;
    setShowNewGuestModal(false);
    setFeedback({
      text: `Guest created successfully! ID: ${guest_id}`,
      isError: false,
    });
    const newGuest: Partial<Guest> = { ...guest, guest_id };
    setSelectedGuest(newGuest);
    return guest_id;
  }

  function onCloseNewGuestForm() {
    if (!confirm("Discard the new guest?")) return;
    setShowNewGuestModal(false);
  }

  function clear() {
    setSelectedGuest(null);
    setNotifications([]);
    setSelectedServicesOpts(
      defaultService ? [serviceTypeOptionFrom(defaultService)] : []
    );
  }
}

interface NProps {
  notifications: GuestNotification[];
}
function Notifications({ notifications }: NProps) {
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

interface SProps {
  serviceTypes: ServiceType[];
  selectedServicesOpts: ReactSelectOption[];
  setSelectedServicesOpts: (val: ReactSelectOption[]) => void;
  selectedGuest: Guest | Partial<Guest> | null;
  setShowNewGuestModal: (show: boolean) => void;
  setFeedback: (feedbackMsg: UserMessage) => void;
  clear: () => void;
}
function RequestedServices({
  serviceTypes,
  selectedServicesOpts,
  setSelectedServicesOpts,
  selectedGuest,
  setShowNewGuestModal,
  setFeedback,
  clear,
}: SProps) {
  return (
    <div>
      <h2>Requested Services</h2>
      <p>
        <i>Select at least 1</i>
      </p>
      <Select
        isMulti
        options={servicesOpts()}
        value={selectedServicesOpts}
        onChange={(newVal: ReactSelectOption[]) =>
          setSelectedServicesOpts(newVal)
        }
      />
      <Button
        type="submit"
        onClick={logVisit}
        className="mt-4 d-block m-auto"
        disabled={!selectedServicesOpts.length || !selectedGuest}
      >
        Log Visit
      </Button>
    </div>
  );

  /** Map services to `Select` options */
  function servicesOpts() {
    return (
      serviceTypes?.map((s: ServiceType) => serviceTypeOptionFrom(s)) ?? []
    );
  }

  async function logVisit(e) {
    e.preventDefault();
    if (!selectedServicesOpts.length) return;
    // TODO validate "form"
    const v: Partial<Visit> = {
      guest_id: selectedGuest?.guest_id,
      service_ids: selectedServicesOpts.map(({ value }) => +value),
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

function serviceTypeOptionFrom(service: ServiceType): ReactSelectOption {
  return {
    value: service.service_id.toString(),
    label: service.name,
  };
}
