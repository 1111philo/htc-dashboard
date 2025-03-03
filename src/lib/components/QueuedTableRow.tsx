import { useState } from "react";
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
  guestLink: JSX.Element;
  moveToCompletedMutation: (guest: GuestResponse) => void;
  i: number;
}

export function QueuedTableRow({
  guest,
  service,
  availableSlotOptions,
  setAvailableSlotOptions,
  slotIntentions,
  setSlotIntentions,
  guestLink,
  moveToCompletedMutation,
  i,
}: QueuedTableRowProps) {
  const defaultSelectVal = "Slot #";
  const [slotChoice, setSlotChoice] = useState<string>(defaultSelectVal);
  const timeRequested = readableDateTime(guest.queued_at);

  function updateSlotNumIntentions(value: string, i: number) {
    const updatedSlotNumIntentions = [...slotIntentions];
    updatedSlotNumIntentions[i] = {
      ...updatedSlotNumIntentions[i],
      slotNumIntention: value,
    };
    setSlotIntentions(updatedSlotNumIntentions);
  }

  function updateSlotOptions(oldSlotChoice: string, newSlotChoice: string) {
    let newSlotOptions: number[] = [...availableSlotOptions];
    if (oldSlotChoice !== defaultSelectVal) {
      newSlotOptions.push(+oldSlotChoice);
    }
    newSlotOptions = newSlotOptions.filter((opt) => opt !== +newSlotChoice);
    setAvailableSlotOptions(newSlotOptions.sort((a, b) => a - b));
  }

  return (
    <tr data-testid="queued-table-row" className="queued-table-row">
      <td>{i + 1}</td>
      <td>{timeRequested}</td>
      <td>
        {guestLink}
        {guest.has_notification && (
          <span data-testid="has-notification-icon">❗</span>
        )}
      </td>

      {service.queueable && (
        <td>
          <div className="d-flex flex-column justify-content-end">
            {service.quota ? (
              <div className="d-flex flex-row">
                <Form.Select
                  data-testid="queued-table-row-select"
                  aria-label="Select which slot to assign"
                  value={slotChoice}
                  onChange={(e) => {
                    const oldChoice = slotChoice;
                    const newChoice = e.target.value;
                    setSlotChoice(newChoice);
                    updateSlotOptions(oldChoice, e.target.value);
                    updateSlotNumIntentions(newChoice, i);
                  }}
                  className="me-4"
                >
                  <option>{slotChoice}</option>
                  {slotChoice !== defaultSelectVal && (
                    <option>{defaultSelectVal}</option>
                  )}
                  {availableSlotOptions?.map((slotNum, i) => {
                    return <option key={`${slotNum}-${i}`}>{slotNum}</option>;
                  })}
                </Form.Select>
                <Dropdown drop="down" autoClose={true}>
                  <Dropdown.Toggle
                    variant="outline-primary"
                    data-testid="queued-table-row-dropdown"
                  />
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
