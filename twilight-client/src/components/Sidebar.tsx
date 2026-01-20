import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Home, LogOut, PlusIcon } from "lucide-react";

import type { SidebarType } from "../types";
import api from "../axios";
import { getFromCdn } from "../utils";
import { useUser } from "../userContext";
import { useState } from "react";
import Modal from "./Modal";
import CreateCommunity from "./CreateCommunity";

type Props = { sidebarOpen: boolean };

type CommunityItem = SidebarType["ownedCommunities"][number];

async function fetchOwned(): Promise<CommunityItem[]> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/users/owned`, { withCredentials: true });
  return res.data;
}

async function fetchJoined(): Promise<CommunityItem[]> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/users/joined`, { withCredentials: true });
  return res.data;
}

export default function Sidebar({ sidebarOpen }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const user = useUser();

  const ownedQ = useQuery({
    queryKey: ["sidebar", "owned"],
    queryFn: fetchOwned,
    staleTime: 60_000,
    enabled: !!user,
  });

  const joinedQ = useQuery({
    queryKey: ["sidebar", "joined"],
    queryFn: fetchJoined,
    staleTime: 60_000,
    enabled: !!user,
  });

  if (!user) {
    return (
      <aside className={`sidebar ${sidebarOpen ? "flex" : "hidden"} xl:flex`}>
        <div className="py-2">
          <Link to="/" search={{ posts: "hot", time: "week" }} className="btn muted w-full justify-start gap-2">
            <Home size={18} className="opacity-80" />
            Home
          </Link>

          <Link to="/explore" className="btn muted w-full justify-start gap-2">
            <Compass size={18} className="opacity-80" />
            Explore
          </Link>
        </div>

        <Link to="/auth/login" className="btn primary w-full p-2 mt-2">
          <LogOut size={18} className="opacity-80" />
          Log In
        </Link>
      </aside>
    );
  }

  const owned = ownedQ.data ?? [];
  const joined = joinedQ.data ?? [];

  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? "flex" : "hidden"} xl:flex`}>
        <div className="flex-1 overflow-y-">
          <div className="py-2">
            <Link to="/" search={{ posts: "hot", time: "week" }} className="btn muted w-full justify-start gap-2">
              <Home size={18} className="opacity-80" />
              Home
            </Link>

            <Link to="/explore" className="btn muted w-full justify-start gap-2">
              <Compass size={18} className="opacity-80" />
              Explore
            </Link>

            <button className="btn muted w-full justify-start gap-2" onClick={()=>setOpen(true)}>
              <PlusIcon size={18} className="opacity-80" />
              New community
            </button>
          </div>

          <p className="text-sm font-semibold divider-top py-2">Owned</p>
          {owned.length ? (
            <ul className="mt-2 pb-2">
              {owned.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <Link to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot" }} className="panel flex-row items-center gap-2">
                    <img className="w-8 h-8 rounded-full object-cover" src={c.image ? getFromCdn(c.image) : "/avatar.png"} alt="" />
                    <span className="text-sm">{c.name}</span>
                  </Link>
                  <span className="text-xs text-tw-muted">{c.postsCount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-tw-muted py-2">Nothing here yet.</p>
          )}

          <p className="text-sm font-semibold divider-top py-2">Communites</p>
          {joined.length ? (
            <ul className="mt-2 pb-2">
              {joined.map((c) => (
                <li key={c.id} className="panel flex-row justify-between items-center gap-2 hover:bg-tw-primary/10 p-2">
                  <Link to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot" }} className="flex items-center gap-2  ">
                    <img className="w-8 h-8 rounded-full object-cover" src={c.image ? getFromCdn(c.image) : "/avatar.png"} alt="" />
                    <span className="truncate text-sm">{c.name}</span>
                  </Link>
                  <span className="text-xs text-tw-muted">{c.postsCount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-tw-muted pt-2">Nothing here yet.</p>
          )}
        </div>

        <Link to="/auth/logout" className="btn w-full justify-start border-none p-2 hover:danger mb-2 gap-2">
          <LogOut size={18} className="opacity-80" />
          Logout
        </Link>
        <div className="py-2 pb-12 divider-top">
          <Link to="/user/$id" params={{ id: user.id }} activeOptions={{ includeSearch: false }} className="panel mb-4 flex-row rounded-lg hover:bg-tw-primary/10">
            <img src={user.image ? getFromCdn(user.image) : "/anonymous.png"} className="w-10 h-10 rounded-full object-cover border border-tw-border/80" alt="profile" />
            <span>{user.name}</span>
          </Link>
        </div>
      </aside>
      {open ? (
        <Modal onClose={() => setOpen(false)} background={true} lightbox={false}>
          <div className="p-4">
            <CreateCommunity setIsOpen={setOpen}/>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
