import { Button, Form } from "react-bootstrap";
import { FeedbackMessage } from "./";
import { today } from "../utils";
import React, { useState } from "react";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");

  const sanitize = (input: string) => input.trim().replace(/\s+/g, " ");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "first_name":
        setFirstName(sanitize(value));
        break;
      case "last_name":
        setLastName(sanitize(value));
        break;
      case "dob":
        setDob(value);
        break;
      default:
        break;
    }
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    debugger;
    const valid =
      [firstName, lastName, dob].filter((v) => v.length).length >= 2;

    if (!valid) {
      setFormFeedback({
        text: "You must fill in at least 2 fields.",
        isError: true,
      });
      e.preventDefault();
      return;
    }
    await submitForm(e);
  };
  return (
    <div className="p-3">
      <h2 className="mb-3">Add New Guest</h2>
      <FeedbackMessage message={formFeedback} className="my-3" />
      <Form onSubmit={onFormSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            id="input-first-name"
            name="first_name"
            value={firstName}
            onChange={onChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            id="input-last-name"
            name="last_name"
            value={lastName}
            onChange={onChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Birthday</Form.Label>
          <Form.Control
            id="input-dob"
            name="dob"
            type="date"
            min="1911-11-11" // ✨
            max={today()}
            value={dob}
            onChange={onChange}
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
