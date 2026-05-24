import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookmarkIcon, ChevronDownIcon, Compass, Home, LogOut, PlusIcon } from "lucide-react";
import { useState } from "react";

import { useUser } from "../userContext";
import { getFromCdn } from "../utils";
import { api } from "../api";
import Modal from "./Modal";
import CreateCommunity from "./CreateCommunity";
import type { CommunityType } from "../types";


function CommunityList({ title, data }: { title: string; data: CommunityType[] }) {
  const [collapsed, setCollapsed] = useState(true);
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full flex flex-col gap-1 mt-2 divider-top">
      <button className="flex items-center justify-between p-2 w-full transition-opacity" onClick={() => setCollapsed(!collapsed)}>
        <span className="flex gap-2">
          <p className="text-sm font-semibold opacity-60 hover:opacity-100 ">{title}</p>
          {title === "Owned" ? (
            <a className="link p-0 text-xs opacity-60 hover:opacity-100 justify-start" onClick={() => setOpen(true)}>
              <PlusIcon size={20} />
            </a>
          ) : (
            ""
          )}
        </span>
        <ChevronDownIcon size={14} className={`opacity-60 hover:opacity-100 transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>

      {!collapsed &&
        (data.length > 0 ? (
          data.map((c) => (
            <Link search={{ posts: "hot", time: "all" }} key={c.id} to="/communities/$id" params={{ id: String(c.id) }} className="link w-full justify-between">
              <div className="flex items-center gap-2 overflow-hidden text-sm">
                <img className="size-6 rounded-full object-cover" src={c.image ? getFromCdn(c.image) : "/avatar.png"} alt="" />
                <span className="truncate">{c.name}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-xs p-2 italic opacity-50">Nothing here yet.</p>
        ))}
      {open && (
        <Modal onClose={() => setOpen(false)} background lightbox={false}>
          <div className="p-4">
            <CreateCommunity setIsOpen={setOpen} />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function Sidebar() {
  const isHome = useLocation({
    select: (location) => location.pathname === "/",
  });
  const isExplore = useLocation({
    select: (location) => location.pathname.includes("explore"),
  });
  const user = useUser();

  const queryConfig = { staleTime: 60_000, enabled: !!user };
  const communities = useQuery<CommunityType[]>({ queryKey: ["sidebar"], queryFn: () => api.get("communities?userId=" + user?.id), ...queryConfig });

  return (
    <>
      <aside className="sidebar">
        <Link to="/" search={{ posts: "hot", time: "all" }} className={`text-2xl md:text-4xl font-bold mb-4 ${isHome ? "text-glow" : ""}`}>
          TWILIGHT
        </Link>

        <div className="flex flex-col flex-1 w-full gap-2 overflow-y-auto space-y-1">
          <Link to="/" search={{ posts: "hot", time: "all" }} className={`link justify-start ${isHome ? "text-glow" : ""}`}>
            <Home size={18} /> Home
          </Link>
          <Link to="/explore" className={`link justify-start ${isExplore ? "text-glow" : ""}`}>
            <Compass size={18} /> Explore
          </Link>
          <Link to="/user/{id}" className="link justify-start">
            <BookmarkIcon size={18} /> Saved
          </Link>

          {user && (
            <>
              <CommunityList title="Owned"data={communities.data?.filter(c => c.members.some(m => m.id === user?.id && m.isCreator)) ?? []} />
              <CommunityList title="Communities" data={communities.data ?? []} />
            </>
          )}
        </div>

        <div className="w-full mt-auto pt-2 divider-top flex flex-col gap-1">
          {user ? (
            <>
              <Link to="/user/$id" params={{ id: user.id }} className="btn btn-muted w-full justify-start gap-2 py-2">
                <img src={user.avatar ? getFromCdn(user.avatar) : "/anonymous.png"} className="size-8 rounded-full" alt="" />
                <span className="truncate">{user.userName}</span>
              </Link>
              <Link to="/auth/logout" className="btn btn-danger muted w-full justify-start gap-2 ">
                <LogOut size={18} /> Logout
              </Link>
            </>
          ) : (
            <Link to="/auth/login" className="btn primary w-full gap-2 py-2">
              <LogOut size={18} /> Log In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
