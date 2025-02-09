import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Timer } from '.'
import {
  Button,
  Card,
  Col,
  Container,
  Row
} from "react-bootstrap";

interface OccupiedSlotCardProps {
  guest: GuestSlottedResponse;
  serviceName: string;
  slotNum: number;
}

export default function OccupiedSlotCard({
  guest,
  serviceName,
  slotNum
}: OccupiedSlotCardProps) {

  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  const nameAndID = `(${guest?.guest_id}) ${guest?.first_name} ${guest?.last_name}`;
  const slotStart = guest.slotted_at
  const slotStatusColor = isExpired ? "danger" : "warning"
  const slotIndicatorStyle = `bg-${slotStatusColor} rounded d-flex justify-content-center align-items-center`

  return (
    <Card className={`border border-${slotStatusColor} border-2 mb-3 shadow`}>
      <Card.Body className="mh-100" style={{ height: "120px" }}>
        <Container className="h-100">
          {guest ? (
            <Row>
              <Col className={slotIndicatorStyle}>{slotNum}</Col>
              <Col
                xs={7}
                className="d-flex flex-column justify-content-between"
              >
                <span onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{nameAndID}</span>
                {serviceName === "Shower" && (
                  <>
                    {/* Default length of shower is 20min */}
                    <Timer
                      slotStart={slotStart!}
                      slotTimeLength={20}
                      setIsExpired={setIsExpired}
                    ></Timer>
                  </>
                )}
              </Col>
              <Col xs={4}>
                <Button
                  variant="primary"
                  onClick={() =>
                    // handleMoveToNewStatus(guest_id, 'Completed', null)
                    console.log("move to Completed clicked")
                  }
                  className="mb-2"
                >
                  Move to Completed
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    // handleMoveToNewStatus(guest_id, 'Queued', null)
                    console.log("move to queued clicked")
                  }
                >
                  Move to Queue
                </Button>
              </Col>
            </Row>
          ) : (
            <Row className="h-100 align-items-center">
              <Col className={slotIndicatorStyle + " h-100"}>{slotNum}</Col>
              <Col xs={11} className="d-flex justify-content-center">
                Available
              </Col>
            </Row>
          )}
        </Container>
      </Card.Body>
    </Card>
  );
}
