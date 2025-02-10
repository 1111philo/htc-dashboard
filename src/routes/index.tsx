import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import { login } from "../lib/api";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";

export const Route = createFileRoute("/")({
  component: LoginView,
  beforeLoad: async ({}) => {
    const { authUser } = useGlobalStore.getState();
    if (authUser) throw redirect({ to: "/new-visit", replace: true });
  },
});

function LoginView() {
  const [errorMsg, setErrorMsg] = useState("");
  const setAuthUser = useGlobalStore((state) => state.setAuthUser);
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

  async function onSubmit(e) {
    e.preventDefault();
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
}
