import ReactDOM from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from './routeTree.gen'
import { notFoundRoute } from "./notFoundRoute";

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const router = createRouter({ routeTree, notFoundRoute })

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
