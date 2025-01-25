import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users_/$userId")({
  component: UserProfileView,
});

function UserProfileView() {
  return (
    <>
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
      <h1>User Profile</h1>
    </>
  );
}
