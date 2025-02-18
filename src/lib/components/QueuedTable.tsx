import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readableDateTime } from "../utils";
import { getAvailableSlots, updateGuestServiceStatus } from "../api";
import { Button, Dropdown, Form, Table } from "react-bootstrap";
import { QueuedTableRow } from "./QueuedTableRow";

interface QueuedTableProps {
  guestsQueued: GuestResponse[];
  service: ServiceType;
}

interface SlotIntention {
  guest: GuestResponse;
  slotNumIntention: string;
}

export default function QueuedTable({
  guestsQueued,
  service,
}: QueuedTableProps) {
  const queryClient = useQueryClient();
  const [assignmentDisabled, setAssignmentDisabled] = useState<boolean>(true);
  const [slotIntentions, setSlotIntentions] =
    useState<SlotIntention[]>(createSlotIntentionObjects);
  const [availableSlotOptions, setAvailableSlotOptions] = useState<number[]>([])

  useEffect(() => {
    setSlotIntentions(createSlotIntentionObjects())
  }, [guestsQueued])

  useEffect(() => {
    // "Assign Slot(s)" button is disabled if there are no slot numbers chosen
    setAssignmentDisabled(() =>
      slotIntentions.every((si) => si.slotNumIntention === 'Slot #')
    )
  }, [slotIntentions])

  useEffect(() => {
    async function fetchSlotOptions() {
      const availableSlots = await getAvailableSlots(service)
      setAvailableSlotOptions(availableSlots)
    }

    fetchSlotOptions()
  }, [])

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
            console.error("Failed to place guest in slot:", e)
          }
        }
      }
    },
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
            (guest, i) => (
              <QueuedTableRow
                guest={guest}
                service={service}
                availableSlotOptions={availableSlotOptions}
                setAvailableSlotOptions={setAvailableSlotOptions}
                slotIntentions={slotIntentions}
                setSlotIntentions={setSlotIntentions}
                i={i}
                key={`${guest.guest_id}-${i}`}
              />
            )
          )}
        </tbody>
      </Table>
    </div>
  );
}
