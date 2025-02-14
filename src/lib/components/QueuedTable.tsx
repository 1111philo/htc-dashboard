import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FeedbackMessage from "./FeedbackMessage";
import { readableDateTime } from "../utils";
import { updateGuestServiceStatus } from "../api";
import { Button, Dropdown, Form, Table } from "react-bootstrap";

interface QueuedTableProps {
  guestsQueued: GuestResponse[];
  availableSlots: number[] | undefined;
  service: ServiceType;
}

export default function QueuedTable({
  guestsQueued,
  availableSlots,
  service,
}: QueuedTableProps) {
  const [slotNumAssigned, setSlotNumAssigned] = useState(Array.from({ length: guestsQueued.length }, (_, i) => '0'));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState({
    text: "",
    isError: false,
  });

  const { mutateAsync: moveToSlottedMutation } = useMutation({
    mutationFn: async ({guest, i}: { guest: GuestResponse, i: number }): Promise<number> | undefined => {
      if (slotNumAssigned[i] === null) {
        setFeedback({
          text: "Must choose a slot.",
          isError: true,
        });
      } else {
        setFeedback({
          text: "",
          isError: false,
        });
        await updateGuestServiceStatus("Slotted", guest, +slotNumAssigned[i]);
        // setSlotNumAssigned(removeAtIndex(slotNumAssigned, slotNumAssigned[i]))
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

  const { mutateAsync: moveToCompletedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Completed", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries()
    }
  })

  return (
    <>
      <h2>Queue</h2>
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
          {guestsQueued?.map(
            (guest, i) => {
              const fullName = guest.first_name + " " + guest.last_name;
              const timeRequested = readableDateTime(guest.queued_at);

              return (
                <tr key={`${guest.guest_id}-${i}`}>
                  <td>{i + 1}</td>
                  <td>{timeRequested}</td>
                  <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{guest.guest_id}</td>
                  <td onClick={() => navigate({ to: `/guests/${guest.guest_id}` })}>{fullName}</td>
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
                              value={(() => {

                                return slotNumAssigned[i]
                              })()}
                              onChange={(e) => {
                                slotNumAssigned[i] = e.target.value
                                setSlotNumAssigned([...slotNumAssigned])
                              }}
                            >
                              <option>Slot #</option>
                              {availableSlots?.map((slotNum, i) => {
                                return (
                                  <option key={`${slotNum}-${i}`}>{slotNum}</option>
                                );
                              })}
                            </Form.Select>
                            <Button
                              className="flex-grow-1 me-2"
                              onClick={async (e) => {
                                e.preventDefault()
                                await moveToSlottedMutation({guest, i})}
                              }
                            >
                              Assign
                            </Button>
                            <Dropdown drop='down' autoClose={true}>
                              <Dropdown.Toggle  variant='outline-primary' />
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() =>
                                    moveToCompletedMutation(guest)
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
                            moveToCompletedMutation(guest)
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
    </>
  );
}

function removeAtIndex(arr, index) {
  if (index < 0 || index >= arr.length) {
      return arr;
  }
  arr.splice(index, 1);
  return arr;
}