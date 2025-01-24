import React, { useState } from 'react'

import { Button, Modal, Form, Table } from 'react-bootstrap'

import { guests } from '../../sample-data/get_guests'

const ServiceView = ({ service }) => {
  const [showEditModal, setShowEditModal] = useState(false)

  return (<>
    {/*
      Title: Service Name
      Button (ADMIN): Edit Service - trigger edit modal
      Table (QUOTA ONLY): Slots
        fields: slot num, Guest Name, Buttons: Move to Completed, Move to Queue
      Table: Queue
        search / filter
        fields: time requested, guest name w/ ID, Button: Move to Completed
      Table Complete
        search / filter
        fields: time requested, guest name w/ ID, Button: Move to Queue
    */}
    <h1>Service Name</h1>
    <Button onClick={ () => setShowEditModal(true) }>Edit Service</Button>
    <Modal show={ showEditModal }>

    </Modal>
    { true ?
      (<>
        <h2>Slots</h2>
        <Table responsive={true}>
          {/* this is a table of guests that have services with services[i].status === "Active" */}
          <thead>
            <tr>
              <th>Slot #</th>
              <th>Guest Name (ID)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Every row: Slot number (iteration) */}
            <tr>
              <td>Slot #</td>
              <td>Guest Name</td>
              <td>Status</td>
              <td>Actions</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Larry</td>
              <td>the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
      </>)
      : ('')
    }
    <h2>Queue</h2>
    <Table responsive={true}>
      <thead>
        <tr>
          <th>Time Requested</th>
          <th>Guest Name (ID)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {/* Every row:
        guests[i].services[i].queued_at,
        guests[i].first_name + last_name + guest_id
        Button
        */}
        { guests.map(({ guest_id, first_name, last_name, services }, i) => {
        let nameAndID = first_name + ' ' + last_name + ` (${guest_id})`
        let completedServices = services.filter((service) => service.status === "Queued")
        return completedServices.map((completeService, i) => {
          return (
            <tr key={i}>
              <td>{ completeService.queued_at }</td>
              <td>{ nameAndID }</td>
              <td><Button>Test</Button></td>
            </tr>
          )
        })
      })}
      </tbody>
    </Table>
    <h2>Completed</h2>
    <Table responsive={true}>
      <thead>
        <tr>
          <th>Time Requested</th>
          <th>Guest Name (ID)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
      { guests.map(({ guest_id, first_name, last_name, services }, i) => {
        let nameAndID = first_name + ' ' + last_name + ` (${guest_id})`
        let completedServices = services.filter((service) => service.status === "Completed")
        return completedServices.map((completeService, i) => {
          return (
            <tr key={i}>
              <td>{ completeService.queued_at }</td>
              <td>{ nameAndID }</td>
              <td><Button>Test</Button></td>
            </tr>
          )
        })
      })}
      </tbody>
    </Table>
  </>)
}

export default ServiceView