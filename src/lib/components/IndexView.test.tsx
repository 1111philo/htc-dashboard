import "@testing-library/jest-dom";
import { IndexView } from "./IndexView";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../router";
import { userEvent } from "@testing-library/user-event";

describe("The Index View", () => {
  it("shows a login form when not logged in", async () => {
    await act(async () => {
      render(<RouterProvider router={router} defaultComponent={IndexView} />);
    });

    expect(screen.getByText(/harry tompson center/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  it("shows an error if the user tries to submit an empty form", async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<RouterProvider router={router} defaultComponent={IndexView} />);
    });

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      screen.getByText(/email and password are required/i)
    ).toBeInTheDocument();
  });

  it("shows an error message if no fields are filled in and the user hits clicks 'forgot password' button", async () => {
    const user = userEvent.setup();
    const originalError = console.error;
    console.error = vi.fn();

    await act(async () => {
      render(<RouterProvider router={router} defaultComponent={IndexView} />);
    });

    // Use a try-catch block to catch the error and assert it
    await user.click(screen.getByRole("button", { name: /forgot password/i }));

    // Use waitFor to handle the asynchronous error
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "There was an issue starting the password reset process:",
        expect.objectContaining({
          message: "username is required to resetPassword",
          name: "EmptyResetPasswordUsername",
        })
      );
    });

    expect(
      screen.getByText(/issue resetting the password/i)
    ).toBeInTheDocument();
    console.error = originalError;
  });
});
