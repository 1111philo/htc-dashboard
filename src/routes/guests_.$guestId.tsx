import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Col, Row, Form, Button, InputGroup, Card } from "react-bootstrap";
import FeedbackMessage from "../lib/components/FeedbackMessage2";
import { Mail, MailOpen, PersonStanding } from "lucide-react";
import { readableDateTime, today } from "../lib/utils";
import { deleteGuest, getGuestData, updateGuest } from "../lib/api";
import { toggleGuestNotificationStatus } from "../lib/api/notification";

interface NotificationGroups {
  active: GuestNotification[];
  archived: GuestNotification[];
}
interface LoaderData {
  guest: Guest;
  services: GuestService[];
  notifications: NotificationGroups;
}

export const Route = createFileRoute("/guests_/$guestId")({
  component: GuestProfileView,
  parseParams: (params): { guestId: number } => ({
    guestId: parseInt(params.guestId),
  }),
  loader: async ({ context, params }): Promise<LoaderData> => {
    const { serviceTypes } = context;
    const { guestId } = params;
    const guestResponse = await getGuestData(guestId);
    if (!guestResponse) {
      // TODO: make sure this hits the 404 route
      // redirect({ to: "not-found" })
    }
    const { total, ...guest } = guestResponse;
    let { guest_services: services, guest_notifications } = guest;

    // NOTE: this is why service_name should be included in Guest.guest_services
    // account for completed services that no longer exist in services types #test
    services = services
      .filter((s) => s.status === "Completed")
      .map((s) => {
        let { name: service_name } = serviceTypes!.find(
          (t) => t.service_id === s.service_id
        ) ?? { name: null };
        !service_name && (service_name = "[Service No Longer Exists]");
        return { ...s, service_name };
      });

    const notifications = {
      active: guest_notifications.filter((n) => n.status === "Active"),
      archived: guest_notifications.filter((n) => n.status === "Archived"),
    };
    return { guest, services, notifications /* visits: */ };
  },
});

// TODO: eventually revive the visits table
export default function GuestProfileView() {
  const {
    guest,
    services,
    notifications: _notifications,
  } = Route.useLoaderData();

  const [notifications, setNotifications] = useState(_notifications);

  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  const guestId = guest.guest_id.toString().padStart(5, "0");

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Guest Profile</h1>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={async () => await deleteGuestRecord(guest.guest_id)}
        >
          Delete Guest Record
        </Button>
      </div>

      <h4>ID: {guestId}</h4>

      <FeedbackMessage message={feedback} />

      <GuestForm guest={guest} onFeedback={setFeedback} />

      <h2 className="mb-3">Active Notifications</h2>
      <Notifications
        notifications={notifications.active}
        onToggleStatus={onToggleNotificationStatus}
      />

      <h2 className="mb-3">Archived Notifications</h2>
      <Notifications
        notifications={notifications.archived}
        onToggleStatus={onToggleNotificationStatus}
      />

      <h2 className="mb-3">Completed Notifications</h2>
      <CompletedServices services={services} />
    </>
  );

  async function deleteGuestRecord(guestId) {
    if (
      !confirm(
        `Are you sure you want to delete this guest?
        ${guest.first_name} ${guest.last_name}, born ${guest.dob}`
      )
    ) {
      return;
    }
    const success = await deleteGuest(guestId);
    // NOTE: success is true if we delete a user that was already deleted
    if (!success) {
      setFeedback({
        text: `Oops! The guest record couldn't be deleted. Try again in a few.`,
        isError: true,
      });
      return;
    }
    navigate({ to: "/guests", replace: true });
  }

  function onToggleNotificationStatus(
    success: boolean,
    notificationId: number,
    initialStatus: GuestNotificationStatus
  ) {
    if (!success) return;
    // move the item to the other notifications array
    // (if we want to move to the TOP of the other array, remove both `.sort()`s)
    let active: GuestNotification[];
    let archived: GuestNotification[];
    let moved: GuestNotification;
    if (initialStatus === "Active") {
      active = notifications.active.filter(
        (n) => n.notification_id !== notificationId
      );
      moved = {
        ...notifications.active.find(
          (n) => n.notification_id === notificationId
        )!,
        status: "Archived",
      };
      archived = [moved, ...notifications.archived].sort((a, b) => {
        const aTime = new Date(a.created_at);
        const bTime = new Date(b.created_at);
        if (aTime < bTime) return -1;
        if (aTime > bTime) return 1;
        return 0;
      });
    } else {
      archived = notifications.archived.filter(
        (n) => n.notification_id !== notificationId
      );
      moved = {
        ...notifications.archived.find(
          (n) => n.notification_id === notificationId
        )!,
        status: "Active",
      };
      active = [moved, ...notifications.active].sort((a, b) => {
        const aTime = new Date(a.created_at);
        const bTime = new Date(b.created_at);
        if (aTime < bTime) return -1;
        if (aTime > bTime) return 1;
        return 0;
      });
    }
    setNotifications({ active, archived });
  }
}

function GuestForm({ guest, onFeedback }) {
  const initialFields: Partial<Guest> = {
    first_name: guest.first_name ?? "",
    last_name: guest.last_name ?? "",
    dob: guest.dob ?? "",
    case_manager: guest.case_manager ?? "",
  };
  const [fields, setFields] = useState(initialFields);

  const isFormChanged =
    guest.first_name !== fields.first_name ||
    guest.last_name !== fields.last_name ||
    guest.dob !== fields.dob ||
    guest.case_manager !== fields.case_manager;

  return (
    <div className="mb-5">
      <Form onSubmit={(e) => saveEditedGuest(e, guest)}>
        <Form.Group className="mb-3">
          <Row>
            <Col className="pe-0">
              <Form.Label className="fst-italic">First Name</Form.Label>
            </Col>
            <Col className="ps-0">
              <Form.Label className="fst-italic ps-0">Last Name</Form.Label>
            </Col>
          </Row>
          <InputGroup>
            <Form.Control
              id="input-first-name"
              name="first_name"
              size="lg"
              aria-label="First name"
              value={fields.first_name}
              onChange={(e) =>
                setFields({ ...fields, first_name: e.target.value })
              }
              className={
                fields.first_name?.trim() !== guest.first_name
                  ? "border-2 border-warning"
                  : ""
              }
            />
            <Form.Control
              id="input-last-name"
              size="lg"
              name="last_name"
              aria-label="Last name"
              value={fields.last_name}
              onChange={(e) =>
                setFields({ ...fields, last_name: e.target.value })
              }
              className={
                fields.last_name?.trim() !== guest.last_name
                  ? "border-2 border-warning"
                  : ""
              }
            />
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Birthday</Form.Label>
          <Form.Control
            id="input-dob"
            name="dob"
            type="date"
            min="1911-11-11" // ✨
            max={today()}
            value={fields.dob}
            onChange={(e) => setFields({ ...fields, dob: e.target.value })}
            className={
              fields.dob?.trim() !== guest.dob ? "border-2 border-warning" : ""
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="fst-italic">Case Manager</Form.Label>
          <Form.Control
            id="input-case-manager"
            name="case_manager"
            type="text"
            value={fields.case_manager ?? ""}
            onChange={(e) =>
              setFields({ ...fields, case_manager: e.target.value })
            }
            className={
              fields.case_manager && // case manager is a nullable field
              fields.case_manager?.trim() !== guest.case_manager
                ? "border-2 border-warning"
                : ""
            }
          />
        </Form.Group>
        {isFormChanged && (
          <div className="d-flex gap-2 justify-content-between">
            <Button variant="warning" type="button" onClick={cancelEdit}>
              Discard Changes
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  function cancelEdit() {
    setFields(initialFields);
  }

  // TODO: circle back after api is fixed
  /** NOTE: This api is broken -- returns success but guest is not altered. */
  async function saveEditedGuest(e: React.FormEvent, guest: Partial<Guest>) {
    e.preventDefault();
    if (
      !confirm(`Save changes?
        ${guest.first_name} -> ${fields.first_name}
        ${guest.last_name} -> ${fields.last_name}
        ${guest.dob} -> ${fields.dob}
        ${guest.case_manager} -> ${fields.case_manager}`)
    ) {
      return;
    }
    const updatedGuest: Partial<Guest> = Object.fromEntries(
      new FormData(e.target)
    );
    const success = await updateGuest(updatedGuest); // placeholder
    if (!success) {
      onFeedback({
        text: "Oops! The edits couldn't be saved. Try again in a few.",
        isError: true,
      });
      return;
    }
    onFeedback({ text: "Successfully updated.", isError: false });
  }
}

type OnToggleNotificationStatus = (
  success: boolean,
  notificationId: number,
  initialStatus: GuestNotificationStatus
) => void;

interface NotificationsProps {
  notifications: GuestNotification[];
  onToggleStatus: OnToggleNotificationStatus;
}
function Notifications({ notifications, onToggleStatus }: NotificationsProps) {
  return (
    <Cards>
      {notifications.length
        ? notifications.map((n, i) => (
            <NotificationCard
              key={n.notification_id}
              n={n}
              onToggleStatus={onToggleStatus}
            />
          ))
        : "None"}
    </Cards>
  );
}

interface NCProps {
  n: GuestNotification;
  onToggleStatus: OnToggleNotificationStatus;
}
function NotificationCard({ n, onToggleStatus }: NCProps) {
  const border = n.status === "Active" ? "border-danger border-2" : "";
  const Icon = () => (n.status === "Active" ? <Mail /> : <MailOpen />);
  const dateTime = readableDateTime(n.created_at);
  return (
    <Card className={"mb-3 shadow " + border}>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div className="fst-italic">
            <span className="me-2">
              <Icon />
            </span>
            Created: {dateTime}
          </div>
          <Button
            size="sm"
            variant={
              n.status === "Active" ? "outline-primary" : "outline-primary"
            }
            onClick={async () => await toggleNotificationStatus(onToggleStatus)}
          >
            {n.status === "Active" ? "Mark Read" : "Unarchive"}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Card.Text>{n.message}</Card.Text>
      </Card.Body>
    </Card>
  );

  async function toggleNotificationStatus(
    onToggleStatus: OnToggleNotificationStatus
  ) {
    const success = await toggleGuestNotificationStatus(n.notification_id);
    onToggleStatus(success, n.notification_id, n.status);
  }
}

interface ServicesProps {
  services: GuestService[];
}
function CompletedServices({ services }: ServicesProps) {
  return (
    <Cards>
      {services.length
        ? services.map((s) => <ServiceCard key={s.guest_service_id} s={s} />)
        : "None"}
    </Cards>
  );
}

interface SCProps {
  s: GuestService;
}
function ServiceCard({ s }: SCProps) {
  return (
    <Card className="mb-3 shadow">
      <Card.Header className="fst-italic">
        <PersonStanding className="m-0 me-1" /> Completed:{" "}
        {s.completed_at ?? "MM/DD/YY"}
      </Card.Header>
      <Card.Body>
        <Card.Title>{s.service_name}</Card.Title>
      </Card.Body>
    </Card>
  );
}

function Cards({ children }) {
  return <div className="mb-5">{children}</div>;
}
