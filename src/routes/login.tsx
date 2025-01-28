import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import * as auth from "../lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginView,
  beforeLoad: async () => {
    if (await auth.isLoggedIn()) throw redirect({ to: "/" });
  },
});

export function LoginView() {
  const [errorMsg, setErrorMsg] = useState("");
  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col>
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <h2 className="text-center mb-4">Harry Tompson Center</h2>
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control type="email" placeholder="Email" name="email" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mb-4">
                  <a href="#" className="text-decoration-none">
                    Forgot password?
                  </a>
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

  async function onSubmit(evt) {
    evt.preventDefault();
    const success = await auth.login(
      evt.target.email.value.trim(),
      evt.target.password.value.trim()
    );
    !success && setErrorMsg("Incorrect username or password.");
  }
}