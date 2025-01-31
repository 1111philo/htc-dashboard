import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { readableDateTime, today } from "../lib/utils";
import StripedListRow from "../lib/components/StripedListRow";
import { Col, ListGroup, Row, Form, Button, InputGroup } from "react-bootstrap";
import { getGuestData } from "../lib/api";

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
    const { guestId } = params;
    const guestResponse = await getGuestData(guestId);
    if (!guestResponse) {
      // TODO: make sure this hits the 404 route
      // redirect({ to: "not-found" })
    }
    const { total, ...guest } = guestResponse;
    const { guest_services: services, guest_notifications: notifications } =
      guest;

    return { guest, services, notifications, /* visits: */ };
  },
});

// TODO: eventually revive the visits table
export default function GuestProfileView() {
  const { guest, services, notifications } = Route.useLoaderData();

  const activeNotifications = notifications.filter(
    (n) => n.status === "Active"
  );
  const archiveNotifications = notifications.filter(
    (n) => n.status === "Archived"
  );
  const sortedNotifications = [...activeNotifications, ...archiveNotifications];

  return (
    <>
      <h1>Guest Profile</h1>
      <GuestForm />
      <Notifications notifications={sortedNotifications} />
      {/* <PastVisits /> */}
    </>
  );

  function GuestForm() {
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
          {/* TODO: add feedback message */}
          <h4>ID: {guest.guest_id.toString().padStart(5, "0")}</h4>
          <Form.Group className="mb-3">
            <Row>
              <Col className="pe-0">
                <Form.Label className="fst-italic">First</Form.Label>
              </Col>
              <Col className="ps-0">
                <Form.Label className="fst-italic ps-0">Last</Form.Label>
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
                fields.dob?.trim() !== guest.dob
                  ? "border-2 border-warning"
                  : ""
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
          <div className="d-flex gap-2 justify-content-between">
            <Button
              variant="danger"
              type="button"
              onClick={async () => await deleteGuest()}
            >
              Delete Guest
            </Button>
            {isFormChanged && (
              <div className="d-flex gap-2">
                <Button variant="warning" type="button" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Form>
      </div>
    );

    function cancelEdit() {
      setFields(initialFields);
    }

    async function deleteGuest() {
      if (
        !confirm(
          `Are you sure you want to delete guest:
          ${guest.first_name} ${guest.last_name}, born ${guest.dob}`
        )
      ) {
        return;
      }
      // delete the guest
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

  function Notifications({ notifications }) {
    return (
      <div className="mb-5">
        <h2>Notifications</h2>
        <ListGroup>
          {notifications.map((n, i) => (
            <NotificationListItem key={i} n={n} i={i} />
          ))}
        </ListGroup>
      </div>
    );

    interface NLIprops {
      n: GuestNotification;
      i: number;
    }
    function NotificationListItem({ n, i }: NLIprops) {
      const [date, time] = readableDateTime(n.created_at).split(" ");
      return (
        <StripedListRow i={i}>
          <Col className="text-center">
            <div>{date}</div>
            <div>{time}</div>
          </Col>

          <Col>{n.message}</Col>

          <Col className="text-center">
            <span
              className={
                "badge rounded-pill bg-opacity-100 " +
                (n.status === "Active"
                  ? "text-bg-warning"
                  : "text-bg-secondary")
              }
            >
              {n.status}
            </span>
          </Col>
        </StripedListRow>
      );
    }
  }

  function PastVisits() {
    return (
      <div className="mb-5">
        <h2>Past Visits</h2>
        <ListGroup>
          {visits.map((v, i) => (
            <VisitListItem key={v.visit_id} v={v} i={i} />
          ))}
        </ListGroup>
      </div>
    );
  }

  interface VLIprops {
    v: Visit;
    i: number;
  }
  function VisitListItem({ v, i }: VLIprops) {
    return (
      <ListGroup.Item as={"li"} action href="#link1">
        <StripedListRow i={i}>
          <Col>{v.updated_at}</Col>
          <Col xs={9} /* className="overflow-x-auto" */>
            <div>
              <span /* className="text-nowrap" */>{services.toString()}</span>
            </div>
          </Col>
        </StripedListRow>
      </ListGroup.Item>
    );
  }
}
