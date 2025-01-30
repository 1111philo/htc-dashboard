import { Button, Form } from "react-bootstrap";
import FeedbackMessage from "./FeedbackMessage";
import { today } from "../utils";
import { Dispatch, SetStateAction, useState } from "react";
import { addGuest } from "../api/guest";

interface NewGuestFormProps {
  setShowNewGuestModal: Dispatch<SetStateAction<boolean>>;
  setViewFeedback?: (_: UserMessage) => void;
  sortedGuests: Guest[];
  setSortedGuests;
}

export default function NewGuestForm(props: NewGuestFormProps) {
  const {
    setShowNewGuestModal,
    setViewFeedback,
    sortedGuests,
    setSortedGuests,
  } = props;
  const [formFeedback, setFormFeedback] = useState<UserMessage>({
    text: "",
    isError: false,
  });
  return (
    <div className="p-3">
      <h2 className="mb-3">Add New Guest</h2>
      <FeedbackMessage
        text={formFeedback.text}
        isError={formFeedback.isError}
        className="my-3"
      />
      <Form
        onSubmit={(e) =>
          submitNewGuestForm(
            e,
            setShowNewGuestModal,
            sortedGuests,
            setSortedGuests
          )
        }
      >
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control id="input-first-name" name="first_name" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control id="input-last-name" name="last_name" />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Birthday</Form.Label>
          <Form.Control
            id="input-dob"
            name="dob"
            type="date"
            min="1911-11-11" // ✨
            max={today()}
          />
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button
            variant="danger"
            type="button"
            onClick={() => {
              if (!confirm("Discard the new guest?")) return;
              setShowNewGuestModal(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );

  // TODO: require at least 2 fields!
  async function submitNewGuestForm(
    e: React.FormEvent<HTMLFormElement>,
    setShowNewGuestModal,
    sortedUsers,
    setSortedUsers
  ) {
    e.preventDefault();
    const guest: Partial<Guest> = Object.fromEntries(new FormData(e.target));
    const guest_id = await addGuest(guest);
    if (!guest_id) {
      setFormFeedback({
        text: "Failed to create guest. Try again in a few.",
        isError: true,
      });
      return;
    }
    setShowNewGuestModal(false);
    setViewFeedback &&
      setViewFeedback({
        text: `Guest created successfully! ID: ${guest_id}`,
        isError: false,
      });

      const newGuest: Partial<Guest> = { ...guest, guest_id }
      setSortedGuests([newGuest, ...sortedGuests])
  }
}
