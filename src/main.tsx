import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { Route, Routes } from "react-router-dom";

// MOVE ME WHEN THESE ROUTES ARE MOVED TO OWN FILES
import { useParams } from "react-router";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<NewVisitView />} />
        <Route path="/new-notification" element={<NewNotificationView />} />
        <Route path="/new-visit" element={<NewVisitView />} />
        <Route path="/visits" element={<VisitsView />} />
        <Route path="/services/:serviceId" element={<ServiceView />} />
        <Route path="/guests" element={<GuestsView />} />
        <Route path="/guests/:guestId" element={<GuestProfileView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/users/:userId" element={<UserDetailView />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

function NewVisitView() {
  return <h1>New Visit</h1>;
}

function NewNotificationView() {
  return <h1>New Notification</h1>;
}

function VisitsView() {
  return <h1>Visits</h1>;
}

/** A single service with or without quota (eg quota - shower,
 * eg no quota - reading glasses). See the queue, a list of
 * services already rendered to guests, and slots (if
 * applicable) */
function ServiceView() {
  return <h1>Service</h1>;
}

function GuestsView() {
  return <h1>Guests</h1>;
}

function GuestProfileView() {
  const { guestId } = useParams()
  return <h1>Guest Profile :: Guest ID: {guestId}</h1>
}

/** Only visible to admins. CRUD users. */
function UsersView() {
  return <h1>Users</h1>;
}

function UserDetailView() {
  const { userId } = useParams();
  return <h1>User ID: {userId}</h1>;
}
