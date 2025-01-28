import ReactDOM from "react-dom/client";
import { RouterProvider, } from "@tanstack/react-router";
import { router } from "./router";
import { LoginView } from "./routes/login";
import * as auth from './lib/api/auth'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  // render login view outside of router system
  const isLoggedIn = await auth.isLoggedIn()
  root.render(
    !isLoggedIn ? <LoginView /> : <RouterProvider router={router} />
  );
}
