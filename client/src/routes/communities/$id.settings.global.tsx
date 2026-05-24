import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/communities/$id/settings/global')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/communities/$id/settings/global"!</div>
}
