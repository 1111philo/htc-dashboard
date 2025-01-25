import { NotFoundRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";

export const notFoundRoute = new NotFoundRoute({
  getParentRoute: () => rootRoute,
  component: NotFound404
});

function NotFound404() {
  return (
    <div>[Customize Me] 404 Not Found [Customize Me]</div>
  )
}