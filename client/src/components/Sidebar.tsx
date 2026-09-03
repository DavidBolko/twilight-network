import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, BookmarkIcon, Compass, Home, LogOut } from "lucide-react";

import { api } from "../api";
import type { CommunityType } from "../types";
import CommunityList from "./CommunityList";
import { useUser } from "../hooks";
import { auth } from "../auth/auth";

const activeCls = "text-glow";
const baseCls = "link";

export default function Sidebar() {
  const user = useUser();

  const communities = useQuery<CommunityType[]>({
    queryKey: ["sidebar", user?.id],
    queryFn: () => api.get("communities?userId=" + user!.id),
    staleTime: 60_000,
    enabled: !!user,
  });

  return (
    <nav className="hidden xl:flex flex-col sticky top-0 py-2 w-fit max-w-[200px] h-screen overflow-y-auto gap-2">
      <Link to="/" search={{ posts: "hot", time: "all" }} className="text-2xl px-2 md:text-4xl font-bold" activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
        TWILIGHT
      </Link>

      <ul className="flex flex-col gap-1">
        <Link to="/" search={{ posts: "hot", time: "all" }} className={baseCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
          <Home size={18} /> Home
        </Link>

        <Link to="/explore" search={{ tab: "Posts" }} className={baseCls} activeProps={{ className: activeCls }}>
          <Compass size={18} /> Explore
        </Link>

        <Link to="/notifications" className={baseCls} activeProps={{ className: activeCls }}>
          <BellIcon size={18} /> Notifications
        </Link>

        {user && (
          <Link to="/user/$id" params={{ id: user.id }} search={{ tab: "Saved" }} className={baseCls}>
            <BookmarkIcon size={18} /> Saved
          </Link>
        )}
      </ul>

      {user && (
        <div className="flex flex-col overflow-y-auto gap-2">
          <CommunityList title="Owned" allowCreate={true} data={communities.data?.filter((c) => c.members.some((m) => m.id === user.id && m.isCreator)) ?? []} />

          <CommunityList title="Communities" data={communities.data ?? []} />
        </div>
      )}

      <div className="mt-auto pt-2 divider-top flex flex-col gap-1">
        {user ? (
          <>
            <Link to="/user/$id" params={{ id: user.id }} search={{ tab: "Posts" }} className="btn btn-muted w-full justify-start">
              <img src={user.avatar || "/anonymous.png"} className="avatar size-8" alt={user.email  || "User"} />

              <span className="truncate">{user.firstName} {user.lastName}</span>
            </Link>
            <button onClick={() => auth.signoutRedirect()} className="btn btn-danger w-full justify-start">
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <button onClick={() => auth.signinRedirect()} className="btn btn-primary w-full">
            <LogOut size={18} /> Log In
          </button>
        )}
      </div>
    </nav>
  );
}
