import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/Navbar.tsx";
import ErrorPage from "../components/ErrorComponent.tsx";
import { useState } from "react";
import Sidebar from "../components/Sidebar.tsx";
import { useThemeToggler } from "../hooks.tsx";

export const Route = createRootRoute({
  component: Root,
  errorComponent: ErrorPage,
});

function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggle } = useThemeToggler()

  const isSidebarAllowed = !location.pathname.includes("/auth") && !location.pathname.includes("/error")

  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleTheme={toggle} isDark={dark} />
      {isSidebarAllowed ? <Sidebar sidebarOpen={sidebarOpen}/>  : null}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
