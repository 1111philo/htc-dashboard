import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { notFoundRoute } from "./notFoundRoute";

export const router = createRouter({
  routeTree,
  notFoundRoute,
  context: {
    serviceTypes: [],
    authUserIsAdmin: false,
  },
});
