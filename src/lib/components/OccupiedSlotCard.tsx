import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Timer } from '.'
import { updateGuestServiceStatus } from '../api';
import {
  Button,
  Card,
  Col,
  Container,
  Row
} from "react-bootstrap";

interface OccupiedSlotCardProps {
  guest: GuestResponse;
  slotNum: number;
}

export default function OccupiedSlotCard({
  guest,
  slotNum
}: OccupiedSlotCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);

  const { mutateAsync: moveToCompletedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Completed", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

  const { mutateAsync: moveToQueuedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Queued", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

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
                {/* {serviceName === "Shower" && (
                  <>
                    // Default length of shower is 20min
                    <Timer
                      slotStart={slotStart!}
                      slotTimeLength={20}
                      setIsExpired={setIsExpired}
                    ></Timer>
                  </>
                )} */}
              </Col>
              <Col xs={4}>
                <Button
                  variant="primary"
                  onClick={() =>
                    moveToCompletedMutation(guest)
                  }
                  className="mb-2"
                >
                  Move to Completed
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() =>
                    moveToQueuedMutation(guest)
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
