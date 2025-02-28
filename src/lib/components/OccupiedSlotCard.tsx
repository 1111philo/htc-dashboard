import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readableTime } from '../utils';
import { updateGuestServiceStatus } from '../api';
import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
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
  const [isExpired, setIsExpired] = useState(false);

  const { mutateAsync: moveToCompletedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Completed", guest, guest.slot_id),
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

  const fullName = `${guest?.first_name} ${guest?.last_name}`;
  const slotStart = guest.slotted_at
  const slotStatusColor = isExpired ? "danger" : "warning"
  const slotIndicatorStyle = `bg-${slotStatusColor} rounded d-flex justify-content-center align-items-center`

  return (
    <Card
      data-testid="queue-slot-card"
      className={`border border-${slotStatusColor} border-2 mb-3 shadow`}
    >
      <Card.Body className="mh-100">
        <Container className="h-100">
          {guest ? (
            <Row>
              <Col className={slotIndicatorStyle}>{slotNum}</Col>
              <Col
                xs={6}
                className="d-flex flex-column justify-content-between fs-5"
              >
                <span>
                  <Link to="/guests/$guestId" params={{ guestId: guest.guest_id }}>
                    {fullName}
                  </Link>
                </span>
                <p>
                  start:
                  <span className='fst-italic'>{` ${readableTime(slotStart)}`}</span>
                </p>
              </Col>
              <Col xs={5} className="d-flex flex-row justify-content-end">
                <Button
                  variant="primary"
                  onClick={() =>
                    moveToCompletedMutation(guest)
                  }
                  className="me-2"
                >
                  Move to Completed
                </Button>
                <Dropdown drop='down' autoClose={true}>
                  <Dropdown.Toggle  variant='outline-primary' />
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() =>
                        moveToQueuedMutation(guest)
                      }
                    >
                      Move back to Queue
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
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
