import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import { Route, Routes } from "react-router-dom";

// MOVE ME WHEN THESE ROUTES ARE MOVED TO OWN FILES
import { useParams } from "react-router";

import NewVisitView from "./views/NewVisitView.tsx"
import NewNotificationView from "./views/NewNotificationView.tsx";
import VisitsView from "./views/VisitsView.tsx"
import AddServiceView from "./views/AddServiceView.tsx"
import ServiceView from "./views/ServiceView.tsx"
import GuestsView from "./views/GuestsView.tsx"
import GuestProfileView from "./views/GuestProfileView.tsx"
import UsersView from "./views/UsersView.tsx"
import UserProfileView from "./views/UserProfileView.tsx";


createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<NewVisitView />} />
        <Route path="/new-notification" element={<NewNotificationView />} />
        <Route path="/new-visit" element={<NewVisitView />} />
        <Route path="/visits" element={<VisitsView />} />
        <Route path="/add-service" element={<AddServiceView />} />
        <Route path="/services/:serviceId" element={<ServiceView />} />
        <Route path="/guests" element={<GuestsView />} />
        <Route path="/guests/:guestId" element={<GuestProfileView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/users/:userId" element={<UserProfileView />} />
      </Route>
    </Routes>
  </BrowserRouter>
);