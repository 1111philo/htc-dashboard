import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import FeedbackMessage from "./FeedbackMessage";
import { readableDateTime } from "../utils";
import { updateGuestServiceStatus } from "../api";
import { Button, Dropdown, Form, Table } from "react-bootstrap";

interface QueuedTableProps {
  guestsQueued: Guest[];
  availableSlots: number[];
  service: ServiceType;
}

export default function QueuedTable({
  guestsQueued,
  availableSlots,
  service,
}: QueuedTableProps) {
  const [slotNumAssigned, setSlotNumAssigned] = useState<number | null>(null);
  const [feedback, setFeedback] = useState({
    text: "",
    isError: false,
  });
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSlotAssignment = (guestId) => {
    if (slotNumAssigned === null) {
      setFeedback({
        text: "Must choose a slot.",
        isError: true,
      });
      setShowFeedback(true);
    } else {
      // TODO:
      // updateGuestServiceStatus(service, "Slotted", guestId, slotNumAssigned);
      setFeedback({
        text: "",
        isError: false,
      });
    }
    console.log(`Assigned to slot ${slotNumAssigned}`);
  };

  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>#</th>
          <th>Time Requested</th>
          <th>Guest ID</th>
          <th>Guest Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {guestsQueued!.map(
          ({ guest_id, first_name, last_name, created_at }, i) => {
            const fullName = first_name + " " + last_name;
            const timeRequested = readableDateTime(created_at);

            return (
              <tr key={`${guest_id}-${i}`}>
                <td>{i + 1}</td>
                <td>{timeRequested}</td>
                <td onClick={() => navigate({ to: `/guests/${guest_id}` })}>{guest_id}</td>
                <td onClick={() => navigate({ to: `/guests/${guest_id}` })}>{fullName}</td>
                <td>
                  <div className="d-flex flex-column justify-content-end">
                    {service.quota ? (
                      <>
                        <FeedbackMessage
                          message={feedback}
                        />
                        <div className="d-flex flex-row">
                          <Form.Select
                            aria-label="Select which slot to assign"
                            onChange={(e) => setSlotNumAssigned(+e.target.value)}
                          >
                            <option>Slot #</option>
                            {availableSlots.map((slotNum, i) => {
                              return (
                                <option key={`${slotNum}-${i}`}>{slotNum}</option>
                              );
                            })}
                          </Form.Select>
                          <Button
                            className="flex-grow-1 me-2"
                            onClick={() =>
                              // TODO: upon blocker resolution
                              handleSlotAssignment(guest_id)
                            }
                          >
                            Assign
                          </Button>
                          <Dropdown drop='down' autoClose={true}>
                            <Dropdown.Toggle  variant='outline-primary' />
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() =>
                                  // TODO: upon blocker resolution
                                  // updateGuestServiceStatus(
                                  //   service,
                                  //   "Completed",
                                  //   guest_id,
                                  //   null
                                  // )
                                  console.log("Moved to completed")
                                }
                              >
                                Move to Completed
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() =>
                          // TODO: upon blocker resolution
                          // updateGuestServiceStatus(
                          //   service,
                          //   "Completed",
                          //   guest_id,
                          //   null
                          // )
                          console.log("Moved to completed")
                        }
                      >
                        Move to Completed
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </Table>
  );
}
