import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import * as API from 'aws-amplify/api'

import FeedbackMessage from '../lib/components/FeedbackMessage2'
import { GuestSelectSearch } from "../lib/components/GuestSelectSearch";
import { Button, Form, Modal } from "react-bootstrap";

export const Route = createFileRoute('/_auth/new-notification')({
  component: NewNotificationView,
})

function NewNotificationView() {

  return (
    <>
      <h1>Add New Notification</h1>
      <AddNewNotificationForm />
    </>
  )
}

function AddNewNotificationForm() {

  const [selectedGuestOpt, setSelectedGuestOpt] = useState<ReactSelectOption | null>();
  const [message, setMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState({
    text: "",
    isError: false
  })

  const handleCreateNotification = async (e) => {
    if (selectedGuestOpt === undefined) {
      setFeedbackMessage({
        text: "Notification must include a guest",
        isError: true
      });
      return;
    }

    const response = await (
      await API.post({
        apiName: 'auth',
        path: '/addGuestNotification',
        options: {
          body: {
            guest_id: +selectedGuestOpt.value,
            message: message,
            status: 'Active',
          },
        },
      }).response
    ).statusCode

    if (response === 200) {
      setFeedbackMessage({
        text: "Notification created!",
        isError: false
      });
      setSelectedGuestOpt(null);
      setMessage("");
    }
  }

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCreateNotification(e)
    }
  }

  return (
    <>
      <FeedbackMessage
        message={feedbackMessage}
      />

      <GuestSelectSearch
        newGuest={undefined}
        selectedGuestOpt={selectedGuestOpt}
        setSelectedGuestOpt={setSelectedGuestOpt}
      />

      <Form id="new-notification">
        <Form.Group className="mb-3" controlId="message">
          <Form.Control
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Message (optional)"
          />
        </Form.Group>

        <Button variant="primary" onClick={handleCreateNotification}>
          Create Notification
        </Button>
      </Form>
    </>
  )
}
