import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readableDateTime } from "../utils";
import { updateGuestServiceStatus } from "../api";
import { Button, Dropdown, Form, Table } from "react-bootstrap";

interface QueuedTableProps {
  guestsQueued: GuestResponse[];
  availableSlots: number[] | undefined;
  service: ServiceType;
}

interface SlotIntention {
  guest: GuestResponse;
  slotNumIntention: string;
}

export default function QueuedTable({
  guestsQueued,
  availableSlots,
  service,
}: QueuedTableProps) {
  const queryClient = useQueryClient();
  const [assignmentDisabled, setAssignmentDisabled] = useState<boolean>(true);
  const [slotIntentions, setSlotIntentions] =
    useState<SlotIntention[]>(createSlotIntentionObjects);

  useEffect(() => {
    setSlotIntentions(createSlotIntentionObjects())
  }, [guestsQueued])

  useEffect(() => {
    // "Assign Slot(s)" button is disabled if there are no slot numbers chosen
    setAssignmentDisabled(() =>
      slotIntentions.every((si) => si.slotNumIntention === 'Slot #')
    )
  }, [slotIntentions])

  function createSlotIntentionObjects(): SlotIntention[] {
    const slotIntentions = guestsQueued.map((g) => {
      return {
        guest: g,
        slotNumIntention: 'Slot #'
      }
    });
    return slotIntentions;
  }

  const { mutateAsync: moveToSlottedMutation } = useMutation({
    mutationFn: async (): Promise<number> | undefined => {
      for (const slotIntention of slotIntentions) {
        const { guest } = slotIntention;
        // if the queued guest was assigned a number
        if (slotIntention.slotNumIntention !== 'Slot #') {
          // update that guest's status
          try {
            await updateGuestServiceStatus("Slotted", guest, +slotIntention.slotNumIntention)
            // remove the now slotted guests from the slotIntentions array
            setSlotIntentions((prevSlotIntentions) =>
              prevSlotIntentions.filter((si) => si.guest.guest_id !== guest.guest_id)
            );
          } catch (e) {
            console.error("Failed to place guest in slot. Here's why:", e)
          }
        }
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
    <div>
      <div className="d-flex justify-content-between">
        <h2>Queue</h2>
        <Button
          className="me-4"
          onClick={async (e) => {
              e.preventDefault()
              await moveToSlottedMutation()
            }
          }
          disabled={assignmentDisabled}
        >
          Assign Slot(s)
        </Button>
      </div>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>#</th>
            <th>Time Requested</th>
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
                  <td>
                    <Link to="/guests/$guestId" params={{ guestId: guest.guest_id }}>
                      {fullName}
                    </Link>
                  </td>
                  <td>
                    <div className="d-flex flex-column justify-content-end">
                      {service.quota ? (
                        <div className="d-flex flex-row">
                          <Form.Select
                            aria-label="Select which slot to assign"
                            onChange={(e) => {
                              const updatedSlotNumIntentions = [...slotIntentions];
                              updatedSlotNumIntentions[i] =
                                { ...updatedSlotNumIntentions[i], slotNumIntention: e.target.value };
                              setSlotIntentions(updatedSlotNumIntentions);
                            }}
                            className="me-4"
                          >
                            <option>Slot #</option>
                            {availableSlots?.map((slotNum, i) => {
                              return (
                                <option key={`${slotNum}-${i}`}>{slotNum}</option>
                              );
                            })}
                          </Form.Select>
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
    </div>
  );
}
