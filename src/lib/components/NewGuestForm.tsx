import { Button, Form } from "react-bootstrap";
import { FeedbackMessage } from "./";
import { today } from "../utils";
import { useState } from "react";

interface NewGuestFormProps {
  onSubmit: (e: React.FormEvent) => Promise<number | null>;
  onClose: () => void;
}

// TODO: require at least N fields to be filled (currently 2)
export default function NewGuestForm(props: NewGuestFormProps) {
  const { onSubmit, onClose } = props;
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
        <div className="d-flex justify-content-between">
          <Button variant="danger" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );

  async function submitForm(e) {
    const guest_id = await onSubmit(e);
    !guest_id &&
      setFormFeedback({
        text: "Failed to create guest. Try again in a few.",
        isError: true,
      });
  }
}
