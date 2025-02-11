import { Card, Col, Container, Row } from "react-bootstrap";

interface AvailableSlotCardProps {
  slotNum: number;
}

export default function AvailableSlotCard({ slotNum }: AvailableSlotCardProps) {
  const slotLabelStyle = `bg-success rounded d-flex justify-content-center align-items-center`

  return (
    <Card className={`border border-success border-2 mb-3 shadow`}>
      <Card.Body className="mh-100">
        <Container className="h-100">
          <Row>
            <Col
              className={slotLabelStyle}
            >
              {slotNum}
            </Col>
            <Col xs={11} className="d-flex justify-content-center fs-4">
              Available
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}
