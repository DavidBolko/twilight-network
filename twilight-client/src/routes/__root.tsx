import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/Navbar.tsx";
import ErrorPage from "../components/ErrorComponent.tsx";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.tsx";
import { useThemeToggler } from "../hooks.tsx";
import api from "../axios.ts";

export const Route = createRootRoute({
  component: Root,
  errorComponent: ErrorPage,
});

function Root() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggle } = useThemeToggler()
  const location = useLocation();

  const isSidebarAllowed =   !(location.pathname === "/auth" || location.pathname.startsWith("/auth/")) && !(location.pathname === "/error" || location.pathname.startsWith("/error/"));

  useEffect(() => {
    api.get("/auth/csrf").catch(() => {});
  }, [location]);
  
  return (
    <>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleTheme={toggle} isDark={dark} />
      {isSidebarAllowed ? <Sidebar sidebarOpen={sidebarOpen}/>  : null}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
