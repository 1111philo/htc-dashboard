import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../../router";
import { userEvent } from "@testing-library/user-event";
import {
  fetchServiceByID,
  fetchServiceGuestsCompleted,
  fetchServiceGuestsQueued,
  fetchServiceGuestsSlotted,
  updateGuestServiceStatus,
} from "../../../lib/api";

vi.mock("../../../lib/api", () => {
  return {
    fetchServiceByID: vi.fn(async () => {
      return {
        service_id: 1, // number
        name: "Test Service", // string
        quota: 0,
        queueable: true,
      };
    }),
    fetchServiceGuestsCompleted: vi.fn(async () => {
      return [
        {
          guest_id: 1,
          guest_service_id: 1,
          first_name: "Test",
          last_name: "Guest",
          status: "Completed",
          completed_at: "2021-09-01T00:00:00.000Z",
          queued_at: "2021-09-01T00:00:00.000Z",
          slotted_at: "2021-09-01T00:00:00.000Z",
        },
      ];
    }),
    fetchServiceGuestsQueued: vi.fn(async () => {
      return [
        {
          guest_id: 2,
          guest_service_id: 1,
          first_name: "Second",
          last_name: "Guest",
          status: "Queued",
          queued_at: "2021-09-01T00:00:00.000Z",
        },
        {
          guest_id: 4,
          guest_service_id: 1,
          first_name: "Fourth",
          last_name: "Guest",
          status: "Queued",
          queued_at: "2021-09-01T00:00:00.000Z",
        },
        {
          guest_id: 5,
          guest_service_id: 1,
          first_name: "Fifth",
          last_name: "Guest",
          status: "Queued",
          queued_at: "2021-09-01T00:00:00.000Z",
        },
      ];
    }),
    fetchServiceGuestsSlotted: vi.fn(async () => {
      return [];
    }),
    updateGuestServiceStatus: vi.fn(async () => {}),
  };
});

vi.mock("../../../lib/api/auth", () => {
  return {
    configure: vi.fn(),
    resetPassword: vi.fn(),
    initForgotPassword: vi.fn(),
    isLoggedIn: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
  };
});

vi.mock("../../../lib/utils/useGlobalStore", () => {
  return {
    useAuthStore: {
      getState: () => ({
        user_id: 1,
        // created_at: string,
        // updated_at: string,
        name: "Test Admin User",
        email: "test_admin_user@app.test",
        role: "admin",
        authUser: {
          user_id: 1,
          name: "Test Admin User",
          email: "test_admin@test.net",
          role: "admin",
        },
      }),
    },
    useServiceTypesStore: {
      getState: () => ({
        serviceTypes: [],
        refreshServices: vi.fn(),
      }),
    },
  };
});

describe("the Service route", () => {
  beforeEach(async () => {
    // let originalError = console.error;
    // console.error = vi.fn();

    await act(async () => {
      render(<RouterProvider router={router} />);
    });

    await act(() => {
      router.navigate({
        to: "/services/$serviceId",
        params: { serviceId: 1 },
      });
    });
  });

  const user = userEvent.setup();

  describe("when it has no quota", () => {
    it("shows the service", async () => {
      await waitFor(() => {
        expect(screen.getByText(/test service/i));
        expect(screen.getByRole("button", { name: /edit service/i }));
        expect(screen.getByRole("button", { name: /delete service/i }));
        expect(
          screen.queryByRole("button", { name: /assign slot/i })
        ).toBeNull();

        // Slotted Area
        const slotCards = screen.queryAllByTestId("queue-slot-card");
        expect(slotCards.length).toBe(0);

        // Queued Area
        const queuedCards = screen.getAllByTestId("queued-table-row");
        expect(queuedCards.length).toBe(3);
        expect(queuedCards[0]).toHaveTextContent(/second guest/i);
        expect(queuedCards[0].getElementsByTagName("select").length).toBe(0);
        expect(queuedCards[0]).toHaveTextContent(/move to completed/i);

        // Completed Area
        const completedCards = screen.getAllByTestId("completed-table-row");
        expect(completedCards.length).toBe(1);
        expect(completedCards[0]).toHaveTextContent(/test guest/i);
        expect(completedCards[0]).toHaveTextContent(/move to queue/i);
      });
    });
    it("allows guests to be moved to completed", async () => {
      await waitFor(async () => {
        const moveButton = screen.getAllByText(/move to completed/i)[0];
        await user.click(moveButton);
        expect(updateGuestServiceStatus).toHaveBeenCalled();
      });
    });
  });
});
