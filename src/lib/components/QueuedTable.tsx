import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { QueuedTableRow } from "./QueuedTableRow";
import { Link } from "@tanstack/react-router";

interface QueuedTableProps {
  guestsQueued: GuestResponse[];
  guestsCompleted: GuestResponse[];
  service: ServiceType;
  availableSlots: number[];
  moveToSlottedMutation: (arg: SlotIntention[]) => void;
  moveToCompletedMutation: (arg: GuestResponse) => void;
}

export interface SlotIntention {
  guest: GuestResponse;
  slotNumIntention: string;
}

export default function QueuedTable({
  guestsQueued,
  guestsCompleted,
  service,
  availableSlots,
  moveToSlottedMutation,
  moveToCompletedMutation,
}: QueuedTableProps): JSX.Element {
  const [assignmentDisabled, setAssignmentDisabled] = useState<boolean>(true);
  const [slotIntentions, setSlotIntentions] = useState<SlotIntention[]>(
    createSlotIntentionObjects
  );
  const [availableSlotOptions, setAvailableSlotOptions] = useState<number[]>(
    []
  );

  useEffect(() => {
    setSlotIntentions(createSlotIntentionObjects());
  }, [guestsQueued]);

  useEffect(() => {
    // "Assign Slot(s)" button is disabled if there are no slot numbers chosen
    setAssignmentDisabled(() =>
      slotIntentions.every((si) => si.slotNumIntention === "Slot #")
    );
  }, [slotIntentions]);

  useEffect(() => {
    setAvailableSlotOptions(availableSlots);
  }, [guestsQueued, guestsCompleted, availableSlots]);

  function createSlotIntentionObjects(): SlotIntention[] {
    const slotIntentions = guestsQueued.map((g) => {
      return {
        guest: g,
        slotNumIntention: "Slot #",
      };
    });
    return slotIntentions;
  }

  return (
    <div>
      <div className="d-flex justify-content-between">
        <h2>{service.queueable ? "Queue" : "Guests"}</h2>
        {service.queueable && (
          <Button
            className="me-4"
            onClick={async (e) => {
              e.preventDefault();
              await moveToSlottedMutation(slotIntentions);
            }}
            disabled={assignmentDisabled}
          >
            Assign Slot(s)
          </Button>
        )}
      </div>
      <Table responsive={true}>
        <thead>
          <tr>
            <th>#</th>
            <th>Time Requested</th>
            <th>Guest Name</th>
            {service.queueable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {guestsQueued?.map((guest, i) => {
            const guestLink = (
              <Link to="/guests/$guestId" params={{ guestId: guest.guest_id }}>
                {guest.first_name} {guest.last_name}
              </Link>
            );
            return (
              <QueuedTableRow
                guest={guest}
                service={service}
                availableSlotOptions={availableSlotOptions}
                setAvailableSlotOptions={setAvailableSlotOptions}
                slotIntentions={slotIntentions}
                setSlotIntentions={setSlotIntentions}
                guestLink={guestLink}
                i={i}
                key={`${guest.guest_id}-${i}`}
                moveToCompletedMutation={moveToCompletedMutation}
              />
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
