/** A list of a guest's services. */

import { PersonStanding } from "lucide-react";
import { Card } from "react-bootstrap";
import Cards from "./Cards";
import { Link } from "@tanstack/react-router";

interface ServicesProps {
  services: GuestService[];
  status: GuestServiceStatus;
}
export default function Services({ services, status }: ServicesProps) {
  return (
    <Cards>
      {services.length
        ? services.map((s) => (
            <ServiceCard key={s.guest_service_id} s={s} status={status} />
          ))
        : "None"}
    </Cards>
  );
}

const timestampsKeys: Record<GuestServiceStatus, keyof GuestService> = {
  Slotted: "slotted_at",
  Queued: "queued_at",
  Completed: "completed_at",
};

interface SCProps {
  s: GuestService;
  status: GuestServiceStatus;
}
function ServiceCard({ s, status }: SCProps) {
  return (
    <Card className="mb-3 shadow">
      <Card.Header className="fst-italic">
        <PersonStanding className="m-0 me-1" /> {status}:{" "}
        {s[timestampsKeys[status]] ?? "(missing from api)"}
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <Link to="/services/$serviceId" params={{ serviceId: s.service_id }}>
            {s.service_name}
          </Link>
        </Card.Title>
      </Card.Body>
    </Card>
  );
}
