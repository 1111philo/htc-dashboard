import React from 'react'
import { useParams } from 'react-router'

const GuestProfileView = () => {
  const { guestId } = useParams()

  return (<>
    {/*
      Title: Guest ID
      Form
        First name field
        Last name field
        Birthday field
        Case Manager field
      Button: Save Changes

      Table: Active Notifications
        fields:
      Table: Archived Notifications
        fields:
      Table: Past Visits
        fields:
    */}
    <h1>Guest Profile (id={guestId})</h1>
  </>)
}

export default GuestProfileView