import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { addGuest, getGuestData } from "../api";
import {
  blankUserMessage,
  guestFormRequirementsSatisfied,
  today,
  trimStringValues,
} from "../utils";
import { FeedbackMessage } from "./";

interface NewGuestFormProps {
  onSubmit: (newGuest: Guest | Partial<Guest>) => void;
  onCancel: () => void;
}

export default function NewGuestForm({
  onSubmit,
  onCancel,
}: NewGuestFormProps) {
  const [feedback, setFeedback] = useState<UserMessage>(blankUserMessage());
  return (
    <div className="p-3">
      <h2 className="mb-3">Add New Guest</h2>
      <FeedbackMessage message={feedback} className="my-3" />
      <Form onSubmit={async (e) => await submitForm(e)}>
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
        <Form.Group className="mb-3">
          <Form.Label>Case Manager</Form.Label>
          <Form.Control id="input-case-manager" name="case_manager" />
        </Form.Group>
        <div className="d-flex justify-content-between">
          <Button variant="danger" type="button" onClick={onClickCancel}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );

  function onClickCancel() {
    if (!confirm("Discard the new guest?")) return;
    onCancel();
  }

  async function submitForm(e) {
    e.preventDefault();
    const partialGuest = Object.fromEntries(
      new FormData(e.target)
    ) as Partial<Guest>;
    trimStringValues(partialGuest);
    if (!guestFormRequirementsSatisfied(partialGuest)) {
      setFeedback({
        text: "At least 2 of the following are required: First Name, Last Name, Birthday",
        isError: true,
      });
      return;
    }
    const guest_id = await addGuest(partialGuest);
    if (!guest_id) {
      setFeedback({
        text: "Failed to create guest. Try again in a few.",
        isError: true,
      });
      return;
    }
    setFeedback(blankUserMessage());
    const { total, ...guest } = (await getGuestData(guest_id))!;
    !total && console.error("There was a problem getting the guest's data.");
    onSubmit(guest ?? { ...partialGuest, guest_id });
  }
}
