import React from "react";
import { Amplify } from "aws-amplify";
import * as Auth from "aws-amplify/auth";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { NavLink as RouterNavLink, Outlet } from "react-router";
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
        <Header />
        <main>
          <Outlet />
        </main>
        <div>API URL: {import.meta.env.VITE_API_URL}</div>
      </Container>
    </>
  );
}

function Header() {
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
          <NavDropdown.Item as={RouterNavLink} to="/TODO" eventKey="5.2">
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
