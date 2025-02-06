import { PersonStanding } from "lucide-react"
import { Card } from "react-bootstrap"
import Cards from "./Cards"

interface ServicesProps {
  services: GuestService[]
}
export default function Services({ services }: ServicesProps) {
  return (
    <Cards>
      {services.length
        ? services.map((s) => <ServiceCard key={s.guest_service_id} s={s} />)
        : 'None'}
    </Cards>
  )
}

interface SCProps {
  s: GuestService
}
function ServiceCard({ s }: SCProps) {
  return (
    <Card className="mb-3 shadow">
      <Card.Header className="fst-italic">
        <PersonStanding className="m-0 me-1" /> Completed:{' '}
        {s.completed_at ?? 'MM/DD/YY'}
      </Card.Header>
      <Card.Body>
        <Card.Title>{s.service_name}</Card.Title>
      </Card.Body>
    </Card>
  )
}
