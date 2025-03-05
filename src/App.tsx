import { Suspense } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

import * as auth from "./lib/api/auth";
import { Route } from "./routes/_auth";
import { capitalize, useAuthStore } from "./lib/utils";

const queryClient = new QueryClient();

export default function App() {
  const { authUserIsAdmin, authUser } = Route.useLoaderData();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppNav authUserIsAdmin={authUserIsAdmin} authUser={authUser} />
        <Container className="mt-4" style={{ maxWidth: "80ch" }}>
          <main className="pt-3">
            <Outlet />
          </main>
        </Container>

        {/* DEV */}
        {import.meta.env.MODE === "staging" ? (
          <>
            <Suspense>
              {/* for use with dynamically importing dev tools in dev mode, which is not yet set up */}
              <TanStackRouterDevtools initialIsOpen={false} />
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
            <div className="mt-5 text-danger float-end">
              API URL: {import.meta.env.VITE_API_URL}- MODE:{" "}
              {import.meta.env.MODE}
            </div>
          </>
        ) : null}
        {/* END DEV */}
      </QueryClientProvider>
    </>
  );
}

function AppNav({ authUserIsAdmin, authUser }) {
  const { serviceTypes } = Route.useLoaderData();
  const { setAuthUser } = useAuthStore.getState();
  const LOGO_SIZE = "50px";
  const navigate = useNavigate();
  return (
    <Navbar
      expand="md"
      sticky="top"
      className="bg-body-tertiary"
      collapseOnSelect={true}
    >
      <Container style={{ maxWidth: "80ch" }}>
        <Navbar.Brand href="#home">
          <img
            src="/img/htc-logo.png"
            alt="HTC Logo"
            style={{ maxHeight: LOGO_SIZE }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" navbarScroll>
            <NavLink to="/new-visit">New Visit</NavLink>
            <NavLink to="/new-notification">New Notification</NavLink>
            <NavDropdown title="Services" id="services-dropdown">
              {authUserIsAdmin && (
                <NavDropdown.Item as="div">
                  <NavLink to="/add-service">Create Service</NavLink>
                  <NavDropdown.Divider className="p-0 m-0" />
                </NavDropdown.Item>
              )}
              {serviceTypes?.map(({ name, service_id }) => {
                return (
                  <NavDropdown.Item key={service_id} as="div">
                    <NavLink
                      to="/services/$serviceId"
                      params={{ serviceId: service_id }}
                    >
                      {name}
                    </NavLink>
                  </NavDropdown.Item>
                );
              })}
            </NavDropdown>
            <NavLink to="/guests">Guests</NavLink>
            {authUserIsAdmin && <NavLink to="/users">Users</NavLink>}
            {/* My Account is broken until we can fetch a single user */}
            <NavDropdown title="My Account" id="my-account-dropdown">
              <NavDropdown.Item as="div">
                <NavLink to="/me">
                  <UserCard
                    authUser={authUser}
                    authUserIsAdmin={authUserIsAdmin}
                  />
                </NavLink>
              </NavDropdown.Item>
              <NavDropdown.Item
                as="div"
                onClick={async () => {
                  await auth.logout();
                  setAuthUser(null);
                  navigate({ to: "/" });
                }}
              >
                <NavDropdown.Divider className="p-0 m-0" />
                <NavLink to="">Log Out</NavLink>
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

interface NLProps {
  to: string;
  params?: Object;
  children?;
}
function NavLink({ to, params, children }: NLProps) {
  return (
    // href allows the menu to collapse
    <Nav.Link as="div" href="#">
      <Link
        to={to}
        params={params}
        className="text-decoration-none text-secondary"
      >
        {children}
      </Link>
    </Nav.Link>
  );
}

import { User, ChevronDown, Settings, LogOut, Shield } from "lucide-react";
function UserCard({ authUser, authUserIsAdmin }) {
  return (
    <div className="d-flex align-items-center gap-2">
      {/* <div className="position-relative">
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px" }}
        >
          <User size={20} className="text-light" />
        </div>
        {authUserIsAdmin && (
          <div
            className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "16px", height: "16px" }}
            title="Admin"
          >
            {<Shield size={10} className="text-light" />}
          </div>
        )}
      </div> */}
      <div className="d-flex flex-column align-items-start ms-1">
        <span className="small fw-semibold text-dark">
          {capitalize(authUser.role)}
        </span>
        <span className="small fw-semibold text-dark">{authUser.name}</span>
        <span className="small text-secondary">{authUser.email}</span>
      </div>
    </div>
  );
}
