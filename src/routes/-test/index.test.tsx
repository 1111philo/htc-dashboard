import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../router";
import { userEvent } from "@testing-library/user-event";

describe("the Index route", () => {
  beforeEach(async () => {
    let originalError = console.error;
    console.error = vi.fn();

    await act(async () => {
      render(<RouterProvider router={router} />);
    });

    await act(() => {
      router.navigate({
        to: "/",
      });
    });
  });

  it("shows a login form when not logged in", async () => {
    await waitFor(() => {
      expect(screen.getByText(/harry tompson center/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByText(/log in/i)).toBeInTheDocument();
    });
  });

  it("shows an error if the user tries to submit an empty form", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/email and password are required/i)
      ).toBeInTheDocument();
    });
  });

  it("shows an error message if no fields are filled in and the user clicks 'forgot password' button", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /forgot password/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /please enter your email address to reset your password/i
        )
      ).toBeInTheDocument();
    });
  });
});
