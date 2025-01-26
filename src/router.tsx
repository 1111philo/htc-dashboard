import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { notFoundRoute } from "./notFoundRoute";

export const router = createRouter({
  routeTree,
  notFoundRoute,
  context: {
    user: null,
    serviceTypes: null,
  },
});
