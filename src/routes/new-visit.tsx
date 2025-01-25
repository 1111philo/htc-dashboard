import { createFileRoute } from '@tanstack/react-router'
import NewVisitView from "../views/NewVisitView";

export const Route = createFileRoute('/new-visit')({
  component: NewVisitView,
  loader: () => {
    // TODO: fetch and return all guests and services
  }
})