import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";
import { Route, Routes } from "react-router-dom";

import NewVisitView from "./views/NewVisitView"
import NewNotificationView from "./views/NewNotificationView";
import VisitsView from "./views/VisitsView"
import AddServiceView from "./views/AddServiceView"
import ServiceView from "./views/ServiceView"
import GuestsView from "./views/GuestsView"
import GuestProfileView from "./views/GuestProfileView"
import UsersView from "./views/UsersView"
import UserProfileView from "./views/UserProfileView";

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
        {/* TEMP FOR DEV -> */} <Route path="/shower" element={<ServiceView service={{ name: "Shower", quota: 10 }}/>} />
        <Route path="/guests" element={<GuestsView />} />
        <Route path="/guests/:guestId" element={<GuestProfileView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/users/:userId" element={<UserProfileView />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
