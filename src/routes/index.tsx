import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import { useState } from "react";
import { initForgotPassword, login } from "../lib/api";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

export const Route = createFileRoute("/")({
  component: IndexView,
  beforeLoad: async () => {
    const { authUser } = useGlobalStore.getState();
    if (authUser) {
      return redirect({ to: "/new-visit", replace: true });
    }
  },
});

export function IndexView() {
  const [errorMsg, setErrorMsg] = useState("");
  const setAuthUser = useGlobalStore((state) => state.setAuthUser);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    if (!e.target?.email?.value || !e.target?.password?.value) {
      setErrorMsg("Email and password are required.");
      return;
    }
    const authUser = await login(
      e.target.email.value.trim(),
      e.target.password.value.trim()
    );
    if (!authUser) {
      setErrorMsg("Incorrect username or password.");
      return;
    }
    setAuthUser(authUser);
    navigate({ to: "/new-visit", replace: true });
  }

  async function resetPassword(setErrorMsg) {
    const emailInput = document.getElementById(
      "email-input"
    ) as HTMLInputElement;
    const email = emailInput.value;
    if (!email)
      setErrorMsg("Please enter your email address to reset your password.");
    const success = await initForgotPassword(email);
    success
      ? setErrorMsg(
          `Check your email for a password reset link from "no-reply@verificationemail.com."`
        )
      : setErrorMsg(
          "There was an issue resetting the password. Try again in a few."
        );
  }

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col>
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <h2 className="text-center mb-4">Harry Tompson Center</h2>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    id="email-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mb-4">
                  <Button
                    variant="link"
                    className="text-decoration-none"
                    onClick={async () => await resetPassword(setErrorMsg)}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button variant="primary" type="submit" className="w-100">
                  Log In
                </Button>
              </Form>
              <p className="mt-3 text-danger">{errorMsg}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
