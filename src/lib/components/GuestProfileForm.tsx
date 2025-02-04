import { useState } from "react";
import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { updateGuest } from "../api";
import { today } from "../utils";

export default function GuestProfileForm({ guest, onFeedback }) {
  const initialFields: Partial<Guest> = {
    first_name: guest.first_name ?? "",
    last_name: guest.last_name ?? "",
    dob: guest.dob ?? "",
    case_manager: guest.case_manager ?? "",
  };
  const [fields, setFields] = useState(initialFields);

  const isFormChanged =
    guest.first_name !== fields.first_name ||
    guest.last_name !== fields.last_name ||
    guest.dob !== fields.dob ||
    guest.case_manager !== fields.case_manager;

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
  }

  // TODO: circle back after api is fixed
  /** NOTE: This api is broken -- returns success but guest is not altered. */
  async function saveEditedGuest(e: React.FormEvent, guest: Partial<Guest>) {
    e.preventDefault();
    if (
      !confirm(`Save changes?
        ${guest.first_name} -> ${fields.first_name}
        ${guest.last_name} -> ${fields.last_name}
        ${guest.dob} -> ${fields.dob}
        ${guest.case_manager} -> ${fields.case_manager}`)
    ) {
      return;
    }

    const updatedGuest = { ...fields, guest_id: guest.guest_id };
    const success = await updateGuest(updatedGuest); // placeholder
    if (!success) {
      onFeedback({
        text: "Oops! The edits couldn't be saved. Try again in a few.",
        isError: true,
      });
      return;
    }
    onFeedback({ text: "Successfully updated.", isError: false });
  }
}

function FormGroup({ children }) {
  return <Form.Group className="mb-3">{children}</Form.Group>;
}

function FormLabel({ children }) {
  return <Form.Label className="fst-italic">{children}</Form.Label>;
}
