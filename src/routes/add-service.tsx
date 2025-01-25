import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/add-service")({
  component: AddServiceView,
});

function AddServiceView() {
  return (
    <>
      {/*
      Title: Add New Service
      Form
        Service Name field
        Service Quota field
      Button: Save Changes
    */}
      <h1>Add Service</h1>
    </>
  );
}
