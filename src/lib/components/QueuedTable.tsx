import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { readableDateTime } from "../utils";
import { updateGuestServiceStatus } from "../api";
import FeedbackMessage from "./FeedbackMessage";

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

  const handleSlotAssignment = (guestId) => {
    if (slotNumAssigned === null) {
      setFeedback({
        text: "Must choose a slot.",
        isError: true
      })
      setShowFeedback(true)
    } else {
      // TODO:
      // updateGuestServiceStatus(service, "Slotted", guestId, slotNumAssigned);
      setFeedback({
        text: "",
        isError: false
      })
    }
    console.log(`Assigned to slot ${slotNumAssigned}`)

  };

  return (
    <Table responsive={true}>
      <thead>
        <tr>
          <th>#</th>
          <th>Time Requested</th>
          <th>Guest Name (ID)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {guestsQueued!.map(
          ({ guest_id, first_name, last_name, created_at }, i) => {
            const nameAndID = first_name + " " + last_name + ` (${guest_id})`;
            const timeRequested = readableDateTime(created_at);

            return (
              <tr key={`${guest_id}-${i}`}>
                <td>{i + 1}</td>
                <td>{timeRequested}</td>
                <td>{nameAndID}</td>
                <td>
                  {service.quota ? (
                    <>
                      { showFeedback &&
                        <FeedbackMessage
                          message={feedback}
                        />
                      }
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
                          onClick={() =>
                            // TODO: upon blocker resolution
                            handleSlotAssignment(guest_id)
                          }
                        >
                          Assign
                        </Button>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    variant="outline-primary"
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
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </Table>
  );
}
