import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Col, Row, Form, Button, InputGroup, Card } from "react-bootstrap";
import FeedbackMessage from "../lib/components/FeedbackMessage2";
import { Mail, MailOpen, PersonStanding } from "lucide-react";
import { readableDateTime, today } from "../lib/utils";
import { deleteGuest, getGuestData } from "../lib/api";

interface LoaderData {
  guest: Guest;
  services: GuestService[];
  notifications: GuestNotification[];
  // visits: Visit[];
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
    let { guest_services: services, guest_notifications: notifications } =
      guest;

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

    return { guest, services, notifications /* visits: */ };
  },
});

// TODO: eventually revive the visits table
export default function GuestProfileView() {
  const { guest, services, notifications } = Route.useLoaderData();

  const navigate = useNavigate();

  const activeNotifications = notifications.filter(
    (n) => n.status === "Active"
  );
  const archivedNotifications = notifications.filter(
    (n) => n.status === "Archived"
  );

  const [feedback, setFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });

  const guestId = guest.guest_id.toString().padStart(5, "0")

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Guest Profile</h1>
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={async () => {
            await deleteGuestRecord(guest.guest_id);
          }}
        >
          Delete Guest Record
        </Button>
      </div>

      <h4>ID: {guestId}</h4>

      <FeedbackMessage message={feedback} />

      <GuestForm guest={guest} />

      <Notifications
        headerText={"Active Notifications"}
        notifications={activeNotifications}
      />

      <Notifications
        headerText={"Archived Notifications"}
        notifications={archivedNotifications}
      />

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
    debugger;
    if (!success) {
      setFeedback({
        text: `Oops! The guest record couldn't be deleted. Try again in a few.`,
        isError: true,
      });
      return
    }
    navigate({ to: "/guests", replace: true });
  }
}

function GuestForm({ guest }) {
  const initialFields: Partial<Guest> = {
    first_name: guest.first_name,
    last_name: guest.last_name,
    dob: guest.dob,
    case_manager: guest.case_manager,
  };
  const [fields, setFields] = useState(initialFields);

  const isFormChanged =
    guest.first_name !== fields.first_name ||
    guest.last_name !== fields.last_name ||
    guest.dob !== fields.dob ||
    guest.case_manager !== fields.case_manager;

  return (
    <div className="mb-5">
      <Form onSubmit={saveEditedGuest}>
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

  async function saveEditedGuest(evt: SubmitEvent) {
    evt.preventDefault();
    if (
      !confirm(`Save changes?
        ${guest.first_name} -> ${fields.first_name}
        ${guest.last_name} -> ${fields.last_name}
        ${guest.dob} -> ${fields.dob}
        ${guest.case_manager} -> ${fields.case_manager}`)
    ) {
      return;
    }
    // TODO: fetch/POST new guest
    const { success } = { success: true }; // placeholder
    if (success) {
      // TODO: report success with a toast (or anything, for now)
    }
  }
}

interface NotificationsProps {
  notifications: GuestNotification[];
  headerText: string;
}
function Notifications({ notifications, headerText }: NotificationsProps) {
  return (
    <div className="mb-5">
      <h2 className="mb-3">{headerText}</h2>
      {notifications.map((n, i) => (
        <NotificationCard key={i} n={n} i={i} />
      ))}
    </div>
  );
}

interface NCProps {
  n: GuestNotification;
}
function NotificationCard({ n }: NCProps) {
  const border = n.status === "Active" ? "border-danger border-2" : "";
  const Icon = () => (n.status === "Active" ? <Mail /> : <MailOpen />);
  const dateTime = readableDateTime(n.created_at);
  return (
    <Card className={"mb-3 shadow " + border}>
      <Card.Header>
        <div className="fst-italic">
          <span className="me-2">
            <Icon />
          </span>
          Created: {dateTime}
        </div>
      </Card.Header>
      <Card.Body>
        <Card.Text>{n.message}</Card.Text>
      </Card.Body>
    </Card>
  );
}

interface ServicesProps {
  services: GuestService[];
}
function CompletedServices({ services }: ServicesProps) {
  return (
    <div>
      <h2 className="mb-3">Completed Services</h2>
      {services.map((s) => {
        return <ServiceCard key={s.guest_service_id} s={s} />;
      })}
    </div>
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
