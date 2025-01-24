import React, { useState } from 'react'

import { Button, Form, Modal, Table } from 'react-bootstrap'

const NewVisitView = () => {
  const [showAddNewGuest, setShowAddNewGuest] = useState(false)
  const [showVisitDetails, setShowVisitDetails] = useState(false)
  console.log("showaddnewguest", showAddNewGuest);

  return (<>
    <h1>Add New Visit</h1>
    <Button variant="primary" onClick={ () => setShowAddNewGuest(true) }>Add New Guest</Button>
    <Modal show={ showAddNewGuest }></Modal>
    <Form>
      <Form.Group className="mb-3" controlId="formUID">
        <Form.Label>UID</Form.Label>
        <Form.Control type="UID" placeholder="Guest UID" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control type="UID" placeholder="Guest Name" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBirthday">
        <Form.Label>Birthday</Form.Label>
        <Form.Control type="UID" placeholder="Guest Birthday" />
      </Form.Group>

      <Button variant="primary" type="submit" onClick={ () => setShowVisitDetails(true) }>
        Sign In Guest
      </Button>
    </Form>

    <Table></Table>
    {/*
      Title: Add New Visit
      Button: Add New Guest - opens dialogue box DONE
      Form - autocomplete fields for lookups
        UID field
        Name field
        Birthday field
      Button: Sign In Guest

      --Below components only active after guest signs in or is created--
      Title: Active Notifications
      Table or cards?: any active notifications

      Title: Services Requested
      Input: autocomplete service lookup to add service for this visit
      Table or cards: added services form autocomplete
      Button: Log Visit - creates new visit (ACTIVE only after at least one service is added)
    */}
    <h1>New Visit</h1>
  </>)
}

export default NewVisitView