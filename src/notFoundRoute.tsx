import { Link, NotFoundRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Button, Col, Container, Row } from "react-bootstrap";

export const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: NotFound404,
});

function NotFound404() {
  return (
    <Container>
      <Row className="py-5 align-items-center justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="display-1 fw-bold">404</h1>
          <div className="mb-4">
            <div className="h2">Page Not Found</div>
            <p className="lead text-muted">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="text-decoration-none"
            as={Link}
            to={".."}
            replace={true}
          >
            Go Back
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
