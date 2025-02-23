import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import * as API from "aws-amplify/api";

import { FeedbackMessage, GuestSelectSearch } from "../lib/components";
import { Button, Form } from "react-bootstrap";

export const Route = createFileRoute("/_auth/new-notification")({
  component: NewNotificationView,
});

function NewNotificationView() {
  return (
    <>
      <h1>Add New Notification</h1>
      <AddNewNotificationForm />
    </>
  );
}

function AddNewNotificationForm() {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [message, setMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({
    text: "",
    isError: false,
  });

  const handleCreateNotification = async (e) => {
    e.preventDefault();

    if (!selectedGuest) {
      setFeedbackMessage({
        text: "Notification must include a guest",
        isError: true,
      });
      return;
    }

    const response = (
      await API.post({
        apiName: "auth",
        path: "/addGuestNotification",
        options: {
          body: {
            guest_id: selectedGuest.guest_id,
            message: message,
            status: "Active",
          },
        },
      }).response
    ).statusCode;

    if (response === 200) {
      setFeedbackMessage({
        text: "Notification created!",
        isError: false,
      });
      setSelectedGuest(null);
      setMessage("");
    }
  };

  return (
    <>
      <FeedbackMessage message={feedbackMessage} />

      <Form id="new-notification" onSubmit={handleCreateNotification}>
        <GuestSelectSearch
          selectedGuest={selectedGuest}
          onSelect={(guest) => setSelectedGuest(guest)}
        />
        <Form.Group className="mb-3" controlId="message">
          <Form.Control
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (optional)"
          />
        </Form.Group>

        <Button type="submit" variant="primary">
          Create Notification
        </Button>
      </Form>
    </>
  );
}
