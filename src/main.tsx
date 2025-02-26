import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import * as auth from "./lib/api/auth";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

auth.configure();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
