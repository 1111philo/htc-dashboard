import { Suspense } from "react";

import { Outlet, Link as RouterNavLink } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Amplify } from "aws-amplify";
import * as Auth from "aws-amplify/auth";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { Container, Nav, NavDropdown } from "react-bootstrap";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_USERPOOLID,
        userPoolClientId: import.meta.env.VITE_USERPOOLWEBCLIENTID,
      },
    },
    API: {
      REST: {
        public: {
          endpoint: `${import.meta.env.VITE_API_URL}/public`,
        },
        auth: {
          endpoint: `${import.meta.env.VITE_API_URL}/auth`,
        },
      },
    },
  },
  {
    API: {
      REST: {
        headers: async ({ apiName }) =>
          apiName === "auth"
            ? {
                Authorization: `Bearer ${(
                  await Auth.fetchAuthSession()
                ).tokens?.idToken?.toString()}`,
              }
            : { "X-Api-Key": "1" },
      },
    },
  }
);

export default function App() {
  return (
    <>
      <Container className="mt-4">
        <AppNav />
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
          <NavDropdown.Item as={RouterNavLink} to="/shower" eventKey="5.2">
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
      </Nav>
    </div>
  );
}
