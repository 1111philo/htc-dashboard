import { useState } from "react";
import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { updateGuest } from "../api";
import {
  blankUserMessage,
  guestFormRequirementsSatisfied,
  today,
  trimStringValues,
} from "../utils";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  guest: Partial<Guest>;
  setViewFeedback: (msg: UserMessage) => void;
}
export default function GuestProfileForm({ guest, setViewFeedback }: Props) {
  const initialFields: Partial<Guest> = {
    first_name: guest.first_name ?? "",
    last_name: guest.last_name ?? "",
    dob: guest.dob ?? "",
    case_manager: guest.case_manager ?? "",
  };
  const [fields, setFields] = useState(initialFields);

  // any guest prop could be blank, hence the `... || ""`
  const isFormChanged =
    (guest.first_name || "") !== fields.first_name ||
    (guest.last_name || "") !== fields.last_name ||
    (guest.dob || "") !== fields.dob ||
    (guest.case_manager || "") !== fields.case_manager;

  const navigate = useNavigate();
  return (
    <div className="mb-5">
      <Form onSubmit={(e) => saveEditedGuest(e, guest)}>
        <FormGroup>
          <Row>
            <Col className="pe-0">
              <FormLabel>First Name</FormLabel>
            </Col>
            <Col className="ps-0">
              <FormLabel>Last Name</FormLabel>
            </Col>
          </Row>
          <InputGroup>
            <Form.Control
              id="input-first-name"
              name="first_name"
              size="lg"
              aria-label="First name"
              value={fields.first_name}
              onChange={(e) =>
                setFields({ ...fields, first_name: e.target.value })
              }
              className={
                fields.first_name?.trim() !== guest.first_name
                  ? "border-2 border-warning"
                  : ""
              }
            />
            <Form.Control
              id="input-last-name"
              size="lg"
              name="last_name"
              aria-label="Last name"
              value={fields.last_name}
              onChange={(e) =>
                setFields({ ...fields, last_name: e.target.value })
              }
              className={
                fields.last_name?.trim() !== guest.last_name
                  ? "border-2 border-warning"
                  : ""
              }
            />
          </InputGroup>
        </FormGroup>
        <FormGroup>
          <FormLabel>Birthday</FormLabel>
          <Form.Control
            id="input-dob"
            name="dob"
            type="date"
            min="1911-11-11" // ✨
            max={today()}
            value={fields.dob}
            onChange={(e) => setFields({ ...fields, dob: e.target.value })}
            className={
              fields.dob?.trim() !== guest.dob ? "border-2 border-warning" : ""
            }
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Case Manager</FormLabel>
          <Form.Control
            id="input-case-manager"
            name="case_manager"
            type="text"
            value={fields.case_manager ?? ""}
            onChange={(e) =>
              setFields({ ...fields, case_manager: e.target.value })
            }
            className={
              fields.case_manager && // case manager is a nullable field
              fields.case_manager?.trim() !== guest.case_manager
                ? "border-2 border-warning"
                : ""
            }
          />
        </FormGroup>
        {isFormChanged && (
          <div className="d-flex gap-2 justify-content-between">
            <Button variant="warning" type="button" onClick={cancelEdit}>
              Discard Changes
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  function cancelEdit() {
    setFields(initialFields);
    setViewFeedback({ text: "", isError: false });
  }

  async function saveEditedGuest(e: React.FormEvent, guest: Partial<Guest>) {
    e.preventDefault();
    const updatedGuest = { ...fields, guest_id: guest.guest_id };
    trimStringValues(updatedGuest);
    if (!guestFormRequirementsSatisfied(updatedGuest)) {
      setViewFeedback({
        text: "At least 2 of the following are required: First Name, Last Name, Birthday",
        isError: true,
      });
      return;
    }
    if (
      !confirm(`Save changes?
        ${guest.first_name || "First Name"} -> ${fields.first_name}
        ${guest.last_name || "Last Name"} -> ${fields.last_name}
        ${guest.dob || "Birthday"} -> ${fields.dob}
        ${guest.case_manager || "Case Manager"} -> ${fields.case_manager}`)
    ) {
      return;
    }
    // convert "" to null
    for (const field in updatedGuest) {
      updatedGuest[field] === "" && (updatedGuest[field] = null);
    }
    const success = await updateGuest(updatedGuest); // placeholder
    if (!success) {
      setViewFeedback({
        text: "Oops! The edits couldn't be saved. Try again in a few.",
        isError: true,
      });
      return;
    }
    setViewFeedback({ text: "Successfully updated.", isError: false });
    navigate({ to: ".", replace: true });
  }
}

function FormGroup({ children }) {
  return <Form.Group className="mb-3">{children}</Form.Group>;
}

function FormLabel({ children }) {
  return <Form.Label className="fst-italic">{children}</Form.Label>;
}
