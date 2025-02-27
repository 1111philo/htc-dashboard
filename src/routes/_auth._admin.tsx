import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_admin')({
  component: RouteComponent,
  beforeLoad: ({ context }): AppContext => {
    const { authUserIsAdmin } = context
    if (!authUserIsAdmin) {
      throw redirect({ to: ".." })
    }
    return context
  }
})

function RouteComponent() {
  return <Outlet /> 
}
