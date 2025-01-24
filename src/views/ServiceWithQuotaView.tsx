import React from 'react'

const ServiceWithQuotaView = () => {
  return (<>
    {/*
      Title: Service Name
      Button (ADMIN): Edit Service
      Table: Slots
        fields: slot num, Guest Name, Buttons: Move to Completed, Move to Queue
      Table: Queue
        search / filter
        fields: time requested, guest name w/ ID, Dropdown with available slots to pick, Button: Move to Completed
      Table Complete
        search / filter
        fields: time requested, guest name w/ ID, Button: Move to Queue
    */}
    <h1>A service with a quota! Which one could it be?</h1>
  </>)
}

export default ServiceWithQuotaView