import { createFileRoute } from "@tanstack/react-router";
import { Col, ListGroup, Row, Table, Container } from "react-bootstrap";

export const Route = createFileRoute("/guests_/$guestId")({
  component: GuestProfileView,
});

import mockGuests from "../../sample-data/get_guests__true_format.json";

export default function GuestProfileView() {
  const { guestId } = Route.useParams();
  const guests: Guest[] = mockGuests;
  const guest = guestFromId(parseInt(guestId));
  const guestFullName = `${guest.first_name} ${guest.last_name}`;

  const services: GuestService[] = JSON.parse(guest.services as string);

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
  notifications = [...activeNotifications, ...archiveNotifications]

  return (
    <>
      {/*
      Title: Guest ID
      Form
        First name field
        Last name field
        Birthday field
        Case Manager field
      Button: Save Changes

      Table: Active Notifications
        fields:
      Table: Archived Notifications
        fields:
      Table: Past Visits
        fields:
    */}
      <h1>{guestFullName}</h1>

      {/* <GuestForm /> */}

      <Notifications notifications={notifications} />

      {/* <PastVisits /> */}
    </>
  );

  function GuestForm() {
    return <h2>Guest Form</h2>;
  }

  function Notifications({ notifications }) {
    return (
      <div>
        <h2>Notifications</h2>
        <ListGroup>
        {notifications.map((n, i) => {
            return (
              <ListItem n={n} i={i} />
            );
          })}
        </ListGroup>
      </div>
    );

    function ListItem({ n, i }) {
      return <ListGroup.Item key={n.notification_id} className="p-0">
        <Container>
          <Row
            className={"flex-nowrap align-items-center " +
              (isEven(i) ? "bg-secondary bg-opacity-10" : "bg-white")}
          >
            <Col>{n.created_at}</Col>
            <Col xs={6}>{n.message}</Col>
            <Col className="text-center">
              <span className={"badge rounded-pill bg-opacity-100 " +
                (n.status === "Active" ? "text-bg-warning" : "text-bg-secondary")}>
                {n.status}
              </span>
            </Col>
          </Row>
        </Container>
      </ListGroup.Item>;
    }
  }

  function PastVisits() {
    return (
      <div>
        <h2>Past Visits</h2>
        <ul>
          {visits.map((v) => {
            return (
              <VisitListItem
                key={v.visit_id}
                guest={v.guest_id}
                services={v.service_ids}
              />
            );
          })}
        </ul>
      </div>
    );
  }

  function VisitListItem() {
    return (
      <ListGroup.Item /* as={"li"} */ action href="#link1">
        <div className="d-flex justify-content-center align-items-center">
          <span>{guestFullName}</span>
          <span>{services}</span>
        </div>
      </ListGroup.Item>
    );
  }

  /* async */ function guestFromId(id: number): Guest | null {
    return guests.find((g) => g.guest_id === id) ?? null;
  }
}

// UTIL
function isEven(num) {
  return (num & 1) === 0;
}