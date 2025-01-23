import { NavLink, Outlet } from "react-router";

export default function AppLayout() {
  return (
    <>
      <Header />
      <div id="main-layout"></div>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function Header() {
  return (
    <nav id="main-nav">
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        Home
      </NavLink>
    </nav>
  );
}
