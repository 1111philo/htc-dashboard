import { Card, Col, Container, Row } from "react-bootstrap";

interface AvailableSlotCardProps {
  slotNum: number;
}

export default function AvailableSlotCard({ slotNum }: AvailableSlotCardProps) {
  const slotLabelStyle = `bg-success rounded d-flex justify-content-center align-items-center h-100`

  return (
    <Card className={`border border-success border-2 mb-3 shadow`}>
      <Card.Body className="mh-100" style={{ height: "120px" }}>
        <Container className="h-100">
          <Row className="h-100 align-items-center">
            <Col
              className={slotLabelStyle}
            >
              {slotNum}
            </Col>
            <Col xs={11} className="d-flex justify-content-center">
              Available
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}
