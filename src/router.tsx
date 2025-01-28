import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { notFoundRoute } from "./notFoundRoute";
import { appContext } from "./routes/__root";

export const router = createRouter({
  routeTree,
  notFoundRoute,
  context: appContext, 
});
