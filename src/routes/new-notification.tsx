import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import * as API from "aws-amplify/api";

import { Button, Form } from "react-bootstrap";
import Select from "react-select";

import mockGuests from "../../sample-data/get_guests.json";

export const Route = createFileRoute("/new-notification")({
  component: NewNotificationView,
});

const allGuests = mockGuests.map((g) => {
  return {
    ...g,
    value: g.guest_id,
    label: `${g.guest_id} : ${g.first_name} ${g.last_name} : ${g.dob}`,
  };
});

const getGuestOptions = async () => {
  // fetch all guests
  // const allGuests = await (
  //   await API.post({
  //     apiName: "auth",
  //     path: "/getGuests",
  //   }).response
  // ).body.json();
  // console.log("allGuests", allGuests)
  // return allGuests
};

function NewNotificationView() {
  return (
    <>
      <h1>New Notification</h1>
      <AddNewNotificationForm />
    </>
  );
}

function AddNewNotificationForm() {
  const [selectedGuest, setSelectedGuest] = useState<ReactSelectOption>();
  const [message, setMessage] = useState("");

  const handleCreateNotification = async (e) => {
    if (selectedGuest === undefined) {
      // TODO: warn user
      return;
    }
    console.log("notif guest", selectedGuest);
    console.log("notif message", message);
    // const response = await (
    //   await API.post({
    //     apiName: "auth",
    //     path: "/addGuestNotification",
    //     options: {
    //       body: {
    //         guest_id: selectedGuest.value, // TODO: 
    //         message: "This is a message",
    //         status: "Active"
    //       }
    //     }
    //   }).response
    // ).statusCode
    // return response
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      // submit form
      console.log("key", e.key);
      console.log("notif guest", selectedGuest);
      console.log("notif message", message);
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="guest">
        <Form.Label>
          <i>Search by UID, Name, or Birthday (YYYY/MM/DD):</i>
        </Form.Label>
        <Select
          id="guest-dropdown"
          options={allGuests}
          value={selectedGuest}
          onChange={(searchInput) => setSelectedGuest(searchInput)}
          placeholder="Guest"
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="message">
        <Form.Control
          type="text"
          placeholder="Message (optional)"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnter}
        />
      </Form.Group>

      <Button variant="primary" onClick={handleCreateNotification}>
        Create Notification
      </Button>
    </Form>
  );
}
