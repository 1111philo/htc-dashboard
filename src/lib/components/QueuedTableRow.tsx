import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuestServiceStatus } from "../api";
import { readableDateTime } from "../utils";
import { Button, Dropdown, Form } from "react-bootstrap";

interface SlotIntention {
  guest: GuestResponse;
  slotNumIntention: string;
}
interface QueuedTableRowProps {
  guest: GuestResponse;
  service: ServiceType;
  availableSlotOptions: number[];
  setAvailableSlotOptions: React.Dispatch<React.SetStateAction<number[]>>;
  slotIntentions: SlotIntention[];
  setSlotIntentions: React.Dispatch<React.SetStateAction<SlotIntention[]>>;
  i: number;
}

export function QueuedTableRow({
  guest,
  service,
  availableSlotOptions,
  setAvailableSlotOptions,
  slotIntentions,
  setSlotIntentions,
  i
}: QueuedTableRowProps) {
  const queryClient = useQueryClient();
  const [slotChoice, setSlotChoice] = useState<string>("Slot #");
  const fullName = guest.first_name + " " + guest.last_name;
  const timeRequested = readableDateTime(guest.queued_at);

  function updateSlotNumIntentions(e, i: number, restore: boolean = false) {
    const updatedSlotNumIntentions = [...slotIntentions];
    if (restore) {
      updatedSlotNumIntentions[i] = {
        ...updatedSlotNumIntentions[i],
        slotNumIntention: "Slot #",
      };
    } else {
      updatedSlotNumIntentions[i] = {
        ...updatedSlotNumIntentions[i],
        slotNumIntention: e.target.value,
      };
    }
    setSlotIntentions(updatedSlotNumIntentions);
  }

  function updateSlotOptions(slotChoice: string, opt: "restore" | "remove") {
    if (opt === "restore" && slotChoice !== "Slot #") {
      // only restore if number doesn't already exist in availableSlotOptions
      if (!availableSlotOptions.some((so) => so === +slotChoice)) {
        setAvailableSlotOptions((prevOpts) =>
          [...prevOpts, +slotChoice].sort((a, b) => a - b)
        );
      }
    }
    if (opt === "remove") {
      setAvailableSlotOptions((prevOpts) =>
        prevOpts.filter((opt) => opt !== +slotChoice)
      );
    }
  }

  const { mutateAsync: moveToCompletedMutation } = useMutation({
    mutationFn: (guest: GuestResponse): Promise<number> =>
      updateGuestServiceStatus("Completed", guest, null),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return (
    <tr>
      <td>{i + 1}</td>
      <td>{timeRequested}</td>
      <td>
        <Link to="/guests/$guestId" params={{ guestId: guest.guest_id }}>
          {fullName}
        </Link>
      </td>

      {service.queueable && (
        <td>
          <div className="d-flex flex-column justify-content-end">
            {service.quota ? (
              <div className="d-flex flex-row">
                <Form.Select
                  aria-label="Select which slot to assign"
                  value={slotChoice}
                  onClick={(e) => {
                    setSlotChoice("Slot #");
                    updateSlotOptions(e.target.value, "restore");
                    updateSlotNumIntentions(e, i, true);
                  }}
                  onChange={(e) => {
                    setSlotChoice(e.target.value);
                    updateSlotOptions(e.target.value, "remove");
                    updateSlotNumIntentions(e, i);
                  }}
                  className="me-4"
                >
                  <option>{slotChoice}</option>
                  {availableSlotOptions?.map((slotNum, i) => {
                    return <option key={`${slotNum}-${i}`}>{slotNum}</option>;
                  })}
                </Form.Select>
                <Dropdown drop="down" autoClose={true}>
                  <Dropdown.Toggle variant="outline-primary" />
                  <Dropdown.Menu>
                    <Dropdown.Item
                      onClick={() => moveToCompletedMutation(guest)}
                    >
                      Move to Completed
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => moveToCompletedMutation(guest)}
              >
                Move to Completed
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
