import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../lib/utils";
import { getUserByEmail, initForgotPassword, login } from "../lib/api";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Route as NewVisitRoute } from "./_auth.new-visit";

export const Route = createFileRoute("/")({
  component: IndexView,
  beforeLoad: async () => {
    const { authUser } = useAuthStore.getState();
    if (authUser) throw redirect({ to: NewVisitRoute.path, replace: true });
  },
});

export function IndexView() {
  const [errorMsg, setErrorMsg] = useState("");
  const { setAuthUser } = useAuthStore.getState();
  const navigate = useNavigate();

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

  async function onSubmit(e) {
    e.preventDefault();

    let {
      target: { email, password },
    } = e;
    email = email?.value.trim();
    password = password?.value.trim();

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    const authUser = await login(email, password);
    if (!authUser) {
      setErrorMsg("Incorrect username or password.");
      return;
    }

    const dbUser = await getUserByEmail(email);
    // TODO: Fix this weirdness. If no authUser, we say incorrect creds. If no dbUser, we say we couldn't find the email.
    if (!dbUser) {
      setErrorMsg(`Oops! We couldn't find a user with that email.`);
      return;
    }

    setAuthUser({ ...authUser, ...dbUser });
    navigate({ to: NewVisitRoute.path, replace: true });
  }

  async function resetPassword(setErrorMsg) {
    const emailInput = document.getElementById(
      "email-input"
    ) as HTMLInputElement;
    const email = emailInput.value;
    if (!email) {
      setErrorMsg("Please enter your email address to reset your password.");
      return;
    }
    const success = await initForgotPassword(email);
    setErrorMsg(
      success
        ? `Check your email for a password reset link from "no-reply@verificationemail.com."`
        : "There was an issue resetting the password. Try again in a few."
    );
  }
}
