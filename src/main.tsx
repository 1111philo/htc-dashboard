import ReactDOM from "react-dom/client";
import { RouterProvider, } from "@tanstack/react-router";
import { router } from "./router";

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
