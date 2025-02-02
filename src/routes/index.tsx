import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // NOTE: the fact that new-visit is an auth route means it auth status will
    // automatically be checked in _auth.tsx
    throw redirect({ to: "/new-visit" })
  }
})