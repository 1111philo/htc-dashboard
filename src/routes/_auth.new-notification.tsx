import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import * as API from 'aws-amplify/api'

import { Button, Form, Modal } from 'react-bootstrap'
import Select from 'react-select'

export const Route = createFileRoute('/_auth/new-notification')({
  component: NewNotificationView,
})

const getAllGuests = async () => {
  // fetch all guests
  const allGuests = await (
    await API.post({
      apiName: 'auth',
      path: '/getGuests',
      options: {
        body: {
          limit: 10000,
        },
      },
    }).response
  ).body.json()

  return allGuests
}

function NewNotificationView() {
  const queryClient = useQueryClient()

  const { isPending, isError, isLoading, data, error } = useQuery({
    queryKey: ['allGuests'],
    queryFn: getAllGuests,
  })

  if (isPending || isLoading) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <>
      <h1>Add New Notification</h1>
      <AddNewNotificationForm allGuests={data} />
    </>
  )
}

function AddNewNotificationForm({ allGuests }) {
  const [selectedGuest, setSelectedGuest] = useState<ReactSelectOption>()
  const [message, setMessage] = useState('')
  const [creationSuccess, setCreationSuccess] = useState(false)
  const [creationWarning, setCreationWarning] = useState(false)

  const guestOptions = allGuests.rows.map((g) => {
    return {
      ...g,
      value: g.guest_id,
      label: `(ID: ${g.guest_id}) ${g.first_name} ${g.last_name} - ${g.dob}`,
    }
  })

  const handleCreateNotification = async (e) => {
    if (selectedGuest === undefined) {
      setCreationWarning(true)
      return
    }

    const response = await (
      await API.post({
        apiName: 'auth',
        path: '/addGuestNotification',
        options: {
          body: {
            guest_id: selectedGuest.guest_id,
            message: message,
            status: 'Active',
          },
        },
      }).response
    ).statusCode

    if (response === 200) {
      setCreationSuccess(true)
      setSelectedGuest(undefined)
      setMessage('')
    }
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleCreateNotification(e)
    }
  }

  const handleClose = () => {
    setCreationSuccess(false)
    setCreationWarning(false)
  }

  return (
    <>
      <Form id="new-notification">
        <Form.Group className="mb-3" controlId="guest">
          <Form.Label>
            <i>Search by UID, Name, or Birthday (YYYY-MM-DD):</i>
          </Form.Label>
          <Select
            id="guest-dropdown"
            key={`reset-key-${selectedGuest}`}
            options={guestOptions}
            value={selectedGuest}
            onChange={(searchInput) => setSelectedGuest(searchInput)}
            placeholder="Search for a guest..."
          />
        </Form.Group>

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

      <Modal show={creationSuccess} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Notification created!</p>
        </Modal.Body>
      </Modal>

      <Modal show={creationWarning} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Warning ⚠️</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Notification must include a guest.</p>
        </Modal.Body>
      </Modal>
    </>
  )
}
