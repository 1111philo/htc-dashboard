import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { QueuedTableRow } from "./QueuedTableRow";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
let guestResponse: GuestResponse = {
  first_name: "Joe",
  last_name: "Shmoe",
  status: "Queued",
  queued_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  case_manager: "John Doe",
  guest_service_id: 123,
  completed_at: new Date().toISOString(),
  guest_id: 456,
  updated_at: new Date().toISOString(),
  dob: "1990-01-01",
  slot_id: 1,
  slotted_at: new Date().toISOString(),
  service_id: 789,
};
let mockService: ServiceType = {
  service_id: 1,
  name: "Test Service",
  quota: 10,
  queueable: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}; // Add appropriate mock data for service
const mockAvailableSlotOptions = []; // Add appropriate mock data for availableSlotOptions
const mockSetAvailableSlotOptions = vi.fn(); // Mock function for setAvailableSlotOptions
const mockSlotIntentions = []; // Add appropriate mock data for slotIntentions
const mockSetSlotIntentions = vi.fn(); // Mock function for setSlotIntentions

describe("QueuedTableRow", () => {
  it("renders a row for the queued guest", async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <QueuedTableRow
          guest={guestResponse}
          service={mockService}
          availableSlotOptions={mockAvailableSlotOptions}
          setAvailableSlotOptions={mockSetAvailableSlotOptions}
          slotIntentions={mockSlotIntentions}
          setSlotIntentions={mockSetSlotIntentions}
          guestLink={
            <a>
              {guestResponse.first_name} {guestResponse.last_name}
            </a>
          }
          i={0}
        />
      </QueryClientProvider>
    );

    screen.getByText(/joe shmoe/i);
    screen.getByLabelText(/Select which slot to assign/i);
    await user.click(screen.getByTestId("queued-table-row-dropdown"));
    screen.getByText(/move to completed/i);
    expect(screen.queryByTestId("has-notification-icon")).toBeNull();
  });

  it("renders a notification icon when the guest has notifications", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <QueuedTableRow
          guest={{ ...guestResponse, has_notification: true }}
          service={mockService}
          availableSlotOptions={mockAvailableSlotOptions}
          setAvailableSlotOptions={mockSetAvailableSlotOptions}
          slotIntentions={mockSlotIntentions}
          setSlotIntentions={mockSetSlotIntentions}
          guestLink={
            <a>
              {guestResponse.first_name} {guestResponse.last_name}
            </a>
          }
          i={0}
        />
      </QueryClientProvider>
    );

    screen.getByTestId("has-notification-icon");
  });
});
