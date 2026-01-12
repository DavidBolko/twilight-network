import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/Navbar.tsx";
import { UserProvider } from "../userContext.tsx";
import ErrorPage from "../components/ErrorComponent.tsx";
import Chat from "../components/Chat.tsx";

export const Route = createRootRoute({
  component: Root,
  errorComponent: ErrorPage,
});

function Root() {
  return (
    <>
      <UserProvider>
        <Navbar />
        <Outlet />
        <Chat />
        <TanStackRouterDevtools />
      </UserProvider>
    </>
  );
}
