import { createRootRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import Sidebar from "../components/Sidebar.tsx";
import { useThemeToggler } from "../hooks.tsx";
import Dock from "../components/Dock.tsx";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const location = useLocation();
  useThemeToggler();

  const isThreeColumnLayout = location.pathname === "/" || location.pathname === "/explore" || location.pathname.startsWith("/communities/") || location.pathname.startsWith("/post/") || location.pathname.startsWith("/user/");
  const isDashboard = location.pathname.includes("settings")
  console.log(isThreeColumnLayout);

  if (isDashboard) {
    return (
      <div className="min-h-screen w-full">
        <div className="mx-auto w-full h-screen ">
          <nav className="flex fixed top-0 z-50 h-16 w-full p-4 dark:bg-tw-surface bg-tw-light-surface">
            <Link to="/" search={{ posts: "hot", time: "all" }} className={`text-2xl md:text-4xl font-bold text-glow`}>
              TWILIGHT
            </Link>
          </nav>
          <Outlet />
        </div>
      </div>
    );
  }

  if (!isThreeColumnLayout) {
    return (
      <>
        <main className="min-h-screen w-full px-2 py-4">
          <div className="mx-auto w-full ">
            <Outlet />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:pl-32 md:flex-row justify-center min-h-screen w-full bg-tw-light-bg dark:bg-tw-bg">
        <Sidebar />
        <Dock />

        <main className="w-full max-w-[700px] min-h-screen  border-tw-light-border dark:border-tw-border bg-tw-light-surface dark:bg-tw-bg">
          <Outlet />
        </main>

        <aside className="hidden lg:block w-[300px]">{}</aside>
      </div>
    </>
  );
}
