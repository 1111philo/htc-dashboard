import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guests")({
  component: GuestsView,
});

function GuestsView() {
  return (
    <>
      {/*
      Title: Registered Guests
      Table (with sort options):
        fields: UID, First, Last, Has Active Notifications
      */}
      <h1>Guests</h1>
    </>
  );
}
