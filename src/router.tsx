import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const appContext: AppContext = {
  serviceTypes: [],
  authUser: null,
  authUserIsAdmin: false,
};

export const router = createRouter({
  routeTree,
  context: appContext,
});
