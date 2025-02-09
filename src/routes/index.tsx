import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // NOTE: the fact that new-visit is an auth route means auth status will
    // automatically be checked in _auth.tsx before routing to new-visit
    throw redirect({ to: "/new-visit" })
  }
})