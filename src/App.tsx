import { Suspense } from "react";
import {
  Outlet,
  Link as RouterNavLink,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Container, Nav, NavDropdown } from "react-bootstrap";

import * as auth from "./lib/auth";

auth.configure();

export default function App() {
  const isLoginRoute = useRouterState().location.pathname === "/login";
  return (
    <>
      <Container className="mt-4">
        {
          !isLoginRoute && <AppNav /> // hide nav when user navigates to /login after login in (edge case)
        }
        <main>
          <Outlet />
        </main>

        {/* DEV */}
        <Suspense>
          {/* for use with dynamically importing dev tools in dev mode, which is not yet set up */}
          <TanStackRouterDevtools initialIsOpen={false} />
        </Suspense>
        <div className="mt-5 text-danger float-end">
          API URL: {import.meta.env.VITE_API_URL}
        </div>
        {/* END DEV */}
      </Container>
    </>
  );
}

function AppNav() {
  const navigate = useNavigate();
  return (
    <div className="d-flex justify-content-center">
      <Nav variant="tabs" className="mb-4 m-auto">
        <Nav.Item>
          <Nav.Link as={RouterNavLink} to="/new-notification" eventKey="2">
            New Notification
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={RouterNavLink} to="/new-visit" eventKey="3">
            New Visit
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={RouterNavLink} to="/visits" eventKey="4">
            Visits
          </Nav.Link>
        </Nav.Item>
        <NavDropdown title="Services">
          <NavDropdown.Item as={RouterNavLink} to="/add-service" eventKey="5.1">
            Create Service
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item
            as={RouterNavLink}
            to="/services/$serviceId"
            eventKey="5.2"
          >
            Shower
          </NavDropdown.Item>
        </NavDropdown>
        <Nav.Item>
          <Nav.Link as={RouterNavLink} to="/guests" eventKey="6">
            Guests
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={RouterNavLink} to="/users" eventKey="7">
            Users
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => auth.logout(navigate)}>Log Out</Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
}
