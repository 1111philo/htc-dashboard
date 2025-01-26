import { createFileRoute, PathParamError } from "@tanstack/react-router";
import {
  Col,
  ListGroup,
  Row,
  Container,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { today } from "../lib/utility-funcs";

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
      throw new PathParamError();
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

  const guestFullName = `${guest.first_name} ${guest.last_name}`;

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
    return (
      <div className="mb-5">
        <Form onSubmit={submitGuestForm}>
          <Form.Group className="mb-3">
            <div></div>
            <Row>
              <Col className="pe-0">
                <Form.Label>First</Form.Label>
              </Col>
              <Col className="ps-0">
                <Form.Label className="ps-0">Last</Form.Label>
              </Col>
            </Row>
            <InputGroup>
              <Form.Control
                id="input-first-name"
                name="first_name"
                size="lg"
                aria-label="First name"
                value={guest.first_name}
              />
              <Form.Control
                id="input-last-name"
                size="lg"
                name="last_name"
                aria-label="Last name"
                value={guest.last_name}
              />
            </InputGroup>
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
          <Form.Group className="mb-3">
            <Form.Label>Case Manager</Form.Label>
            <Form.Control
              id="input-case-manager"
              name="case_manager"
              type="text"
            />
          </Form.Group>
          <div className="d-flex justify-content-between">
            <Button variant="danger" type="button" onClick={() => {}}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </Form>
      </div>
    );

    function submitGuestForm(evt: SubmitEvent) {
      evt.preventDefault();

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
          {/* <Col xs={9}>
            {
              "TODO: generate service names from service ids **OR!** request a mod to the api response: instead of service ids, return service names"
            }
          </Col> */}
          <Col xs={9} className="overflow-x-auto">
            <div>
              <span /* className="text-nowrap" */>{guestServices}</span>
            </div>
          </Col>
        </StripedListRow>
      </ListGroup.Item>
    );
  }
}

function StripedListRow({ children, i }) {
  return (
    <ListGroup.Item className="p-0">
      <Container>
        <Row
          className={
            "flex-nowrap align-items-center " +
            (isEven(i) ? "bg-secondary bg-opacity-10" : "bg-white")
          }
        >
          {children}
        </Row>
      </Container>
    </ListGroup.Item>
  );
}

function guestFromId(id: number, guests: Guest[]): Guest | null {
  return guests?.find((g) => g.guest_id === id) ?? null;
}

// UTIL
function isEven(num) {
  return (num & 1) === 0;
}
