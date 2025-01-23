import React from "react";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { NavLink as RouterNavLink, Outlet } from "react-router";
import { Container, Nav, NavDropdown } from "react-bootstrap";

export default function App() {
  return (
    <>
      <Header />
      <Container>
        <main>
          <Outlet />
        </main>
      </Container>
    </>
  );
}

function Header() {
  return (
    <Nav variant="pills">
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
        <NavDropdown.Item eventKey="5.4">Create Service</NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item
          /* eventKey="5.1" */ as={RouterNavLink}
          to="TODO"
          eventKey="5.1"
        >
          {/* <Nav.Link as={RouterNavLink} to="TODO" eventKey="5.1">
            Shower
          </Nav.Link> */}
          Shower
        </NavDropdown.Item>
        <NavDropdown.Item eventKey="5.2">Another action</NavDropdown.Item>
        <NavDropdown.Item eventKey="5.3">Something else here</NavDropdown.Item>
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
  );
}

// function Header() {
//   return (
//     <Nav id="main-nav">
//       <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
//         Home
//       </NavLink>
//       <NavLink
//         to="/new-notification"
//         className={({ isActive }) => (isActive ? "active" : "")}
//       >
//         New Notification
//       </NavLink>
//       <NavLink to="/new-visit">New Visit</NavLink>
//       <NavLink to="/visits">Visits</NavLink>
//       {/* TODO: change to container of NavLinks; fetch current services and render them dynamically inside the container */}
//       <div>
//         <span>Services</span>
//         <NavLink to="TODO">Services</NavLink>
//       </div>
//       <NavLink to="/guests">Guests</NavLink>
//       <NavLink to="/users">Users</NavLink>
//     </Nav>
//   );
// }
