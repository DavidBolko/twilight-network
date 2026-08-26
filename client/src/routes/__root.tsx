import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useThemeToggler, useWs } from "../hooks";
import { queryClient } from "../main";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  useThemeToggler();
  useWs(queryClient);

  return <Outlet />;
}
