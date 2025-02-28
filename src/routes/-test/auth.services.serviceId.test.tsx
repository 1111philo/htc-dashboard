import "@testing-library/jest-dom";
// import { useAuthStore, useServiceTypesStore } from "../../lib/utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../router";
import { userEvent } from "@testing-library/user-event";

const quota = 5;

vi.mock("../../lib/api", () => {
  return {
    fetchServiceByID: vi.fn(async () => ({
      service_id: 1, // number
      name: "Test Service", // string
      quota,
      queueable: true,
    })),
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
      return [
        {
          slot_id: 1,
          guest_id: 3,
          guest_service_id: 1,
          first_name: "Third",
          last_name: "Guest",
          status: "Queued",
          queued_at: "2021-09-01T00:00:00.000Z",
          slotted_at: "2021-09-01T00:00:00.000Z",
        },
      ];
    }),
    updateGuestServiceStatus: vi.fn(),
  };
});

vi.mock("../../lib/api/auth", () => {
  return {
    configure: vi.fn(),
    resetPassword: vi.fn(),
    initForgotPassword: vi.fn(),
    isLoggedIn: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
  };
});

vi.mock("../../lib/utils/useGlobalStore", () => {
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

  describe("when it has a quota and queue", () => {
    it("shows the service", async () => {
      await waitFor(() => {
        expect(screen.getByText(/test service/i));
        expect(screen.getByRole("button", { name: /edit service/i }));
        expect(screen.getByRole("button", { name: /delete service/i }));
        expect(screen.getByRole("button", { name: /assign slot/i }));

        // Quota Area
        const slotCards = screen.getAllByTestId("queue-slot-card");
        expect(slotCards.length).toBe(quota);
        expect(slotCards[0]).toHaveTextContent(/third guest/i);
        expect(slotCards[0]).toHaveTextContent(/move to completed/i);
        for (let i = 1; i < slotCards.length; i++) {
          expect(slotCards[i]).toHaveTextContent("Available");
        }

        // Queued Area
        const queuedCards = screen.getAllByTestId("queued-table-row");
        expect(queuedCards.length).toBe(3);
        expect(queuedCards[0]).toHaveTextContent(/second guest/i);
        const selectElement = queuedCards[0].getElementsByTagName("select")[0];
        expect(selectElement.ariaLabel).toBe("Select which slot to assign");
        expect(selectElement.value).toBe("Slot #");
        for (let i = 0; i < selectElement.children.length; i++) {
          const option = selectElement.children[i];
          expect(option.tagName).toBe("OPTION");
          // Should not be able to assign to slot 1
          expect(option.textContent).not.toBe("1");
        }
        // 5 options in total, 1 is taken, so 4 are available + placeholder
        expect(selectElement.children.length).toBe(5);
        expect(screen.getAllByTestId("queued-table-row-dropdown"));

        // Completed Area
        const completedCards = screen.getAllByTestId("completed-table-row");
        expect(completedCards.length).toBe(1);
        expect(completedCards[0]).toHaveTextContent(/test guest/i);
        expect(completedCards[0]).toHaveTextContent(/move to queue/i);
      });
    });
    // it("allows guests to be slotted", async () => {});
    // it("allows guests to be moved to completed", async () => {});
    // it("allows guests to be moved to the queue from a slot", async () => {});
    // it("allows multiple guests to be slotted", async () => {});
    // it("prevents slotting a guest to an occupied slot", async () => {});
  });
});
