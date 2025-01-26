import { createFileRoute } from "@tanstack/react-router";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";

export const Route = createFileRoute("/login")({
  component: LoginView,
  beforeLoad: ({ context }) => {
    // don't show root layout on this page
    context.hideNav = true;
    return { hideNav: true };
  },
});

/* NOTE: NOTHING IS REDIRECTING HERE YET */

function LoginView() {
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
                    type="text"
                    placeholder="Username"
                    name="username"
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
                  <a href="#" className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>

                <Button variant="primary" type="submit" className="w-100">
                  Log In
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );

  function onSubmit(evt) {
    evt.preventDefault();
    const formData = {
      username: evt.target.username.value,
      password: evt.target.password.value,
    };
    console.log("Form submitted:", formData);
  }
}
