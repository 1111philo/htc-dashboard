import React from 'react'
import { useParams } from 'react-router'

const UserProfileView = () => {
  const { userId } = useParams()
  return (<>
    {/*
      Title: Username
      Form
        Name field
        Role field
        email field
        new password field
      Button: Save Changes
      Button (ADMIN): Delete User
    */}
    <h1>User Profile (id={userId})</h1>
  </>)
}

export default UserProfileView