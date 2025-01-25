import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/new-notification")({
  component: NewNotificationView,
});

function NewNotificationView() {
  return (
    <>
      {/*
      Title: New Notification
      Form
        Guest field
        Service field
        Message (optional) field
      Button: Create Notification - creates notification associated with guest
    */}
      <h1>New Notification</h1>
    </>
  );
}
