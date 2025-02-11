import { useState } from "react";
import {
  createFileRoute,
  useLoaderData,
  useNavigate,
} from "@tanstack/react-router";
import { useGlobalStore } from "../lib/utils";
import { resetPassword } from "../lib/api";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordView,
  loaderDeps: ({ search: { email, code } }) => {
    return { email, code };
  },
  // loader: ({ deps: { email, code }}) => {
  //   return { email, code }
  // }
});

function ResetPasswordView() {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { email, code } = Route.useLoaderDeps();
  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Row>
        <Col>
          <Card style={{ width: "400px" }}>
            <Card.Body>
              <h2 className="text-center mb-4">Harry Tompson Center</h2>
              <Form onSubmit={async (e) => await onSubmit(e)}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control name="email" value={email} readOnly />
                </Form.Group>
                <Form.Control name="code" value={code} hidden readOnly />
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="Password"
                    name="password"
                    id="password-input"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control type="password" name="confirm_password" />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Reset Password
                </Button>
              </Form>
              <p className="mt-3 text-danger">{errorMsg}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { email, code, confirm_password, password } = Object.fromEntries(
      new FormData(e.target)
    );
    const success = await resetPassword(email, code, password);
    // TODO: handle invalid confirmation code
    if (!success) {
      setErrorMsg("There was an error resetting your password. Please start over.")
      return
    }
    navigate({ to: "/", replace: true })
  }
}
