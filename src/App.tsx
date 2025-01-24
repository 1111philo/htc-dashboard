import React from 'react';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink as RouterNavLink, Outlet } from 'react-router';
import { Container, Nav, NavDropdown } from 'react-bootstrap';

export default function App() {
  return (
    <>
      <Header />
      <Container>
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
    <Nav variant='pills'>
      <Nav.Item>
        <Nav.Link as={RouterNavLink} to='/new-notification' eventKey='2'>
          New Notification
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={RouterNavLink} to='/new-visit' eventKey='3'>
          New Visit
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={RouterNavLink} to='/visits' eventKey='4'>
          Visits
        </Nav.Link>
      </Nav.Item>
      <NavDropdown title='Services'>
        <NavDropdown.Item as={RouterNavLink} to='/add-service' eventKey='5.1'>
          Create Service
        </NavDropdown.Item>
        <NavDropdown.Divider />
        <NavDropdown.Item as={RouterNavLink} to='/TODO' eventKey='5.2'>
          Shower
        </NavDropdown.Item>
      </NavDropdown>
      <Nav.Item>
        <Nav.Link as={RouterNavLink} to='/guests' eventKey='6'>
          Guests
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={RouterNavLink} to='/users' eventKey='7'>
          Users
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}
