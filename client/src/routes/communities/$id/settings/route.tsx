import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BellIcon, BookmarkIcon, Compass, Link } from "lucide-react";

export const Route = createFileRoute("/communities/$id/settings")({
  component: LayoutComponent,
});

const activeCls = "text-glow";
const baseCls = "link";
function LayoutComponent() {
  return (
    <>
      <div>
        Twilight
      </div>
      <div>
        <nav>
        <ul className="flex flex-col gap-1">
        <Link
          to="/"
          search={{ posts: "hot", time: "all" }}
          className={baseCls}
          activeProps={{ className: activeCls }}
          activeOptions={{ exact: true }}
        >
          <Home size={18} /> Home
        </Link>
        <Link
          to="/explore"
          search={{ tab: "Posts" }}
          className={baseCls}
          activeProps={{ className: activeCls }}
        >
          <Compass size={18} /> Explore
        </Link>
        <Link
          to="/notifications"
          className={baseCls}
          activeProps={{ className: activeCls }}
        >
          <BellIcon size={18} /> Notifications
        </Link>

          </ul>
          
        </nav>
        <Outlet />
      </div>
    </>
  );
}
