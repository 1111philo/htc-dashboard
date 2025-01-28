import { useState } from "react";
import { createFileRoute, PathParamError } from "@tanstack/react-router";
import { today } from "../lib/utils";
import StripedListRow from "../lib/components/StripedListRow";
import { Col, ListGroup, Row, Form, Button, InputGroup } from "react-bootstrap";

interface LoaderData {
  guest: Guest;
  // guestServices: GuestService[];
  guestServices: string;
  guestVisits: Visit[];
}

export const Route = createFileRoute("/guests_/$guestId")({
  component: GuestProfileView,
  parseParams: (params): { guestId: number } => ({
    guestId: parseInt(params.guestId),
  }),
  loader: async ({ context, params }): Promise<LoaderData> => {
    let response = await fetch(
      "../../sample-data/get_guests__true_format.json"
    );
    const guests = await response.json();
    const { guestId } = params;
    const guest = guestFromId(guestId, guests);
    if (!guest) {
      // TODO: why does /<non existent route> not go to custom 404?
      throw new PathParamError(
        `The page "${location.pathname}" does not exist`
      );
    }
    response = await fetch("../../sample-data/get_visits.json");
    const literallyAllVisits: Visit[] = await response.json();
    const guestVisits: Visit[] = literallyAllVisits.filter(
      (v) => v.guest_id === guestId
    );

    const guestServicesArr: GuestService[] = JSON.parse(
      (guest?.services as string) ?? ""
    );

    const { serviceTypes } = context;

    // build a string for the guest services
    const separator = ", ";
    const guestServices = guestServicesArr
      .map((s) => {
        const serviceName = serviceTypes.find(
          (t) => t.service_id === s.service_id
        )?.service_name;
        return `${serviceName}`;
      })
      .join(separator);

    return { guest, guestServices, guestVisits };
  },
});

export default function GuestProfileView() {
  const { guest, guestVisits, guestServices } = Route.useLoaderData();

  let notifications: GuestNotification[] = JSON.parse(
    guest.notifications as string
  ).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const activeNotifications = notifications.filter(
    (n) => n.status === "Active"
  );
  const archiveNotifications = notifications.filter(
    (n) => n.status === "Archived"
  );
  notifications = [...activeNotifications, ...archiveNotifications];

  return (
    <>
      <h1>Guest Profile</h1>
      <GuestForm />
      <Notifications notifications={notifications} />
      <PastVisits />
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
              value={fields.case_manager}
              onChange={(e) =>
                setFields({ ...fields, case_manager: e.target.value })
              }
              className={
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
      return (
        <StripedListRow i={i}>
          <Col>{n.created_at}</Col>
          <Col xs={6}>{n.message}</Col>
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
          {guestVisits.map((v, i) => (
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
              <span /* className="text-nowrap" */>{guestServices}</span>
            </div>
          </Col>
        </StripedListRow>
      </ListGroup.Item>
    );
  }
}

function guestFromId(id: number, guests: Guest[]): Guest | null {
  return guests?.find((g) => g.guest_id === id) ?? null;
}
