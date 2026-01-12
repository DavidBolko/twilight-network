import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { SidebarType } from "../types.ts";
import { getFromCdn } from "../utils.ts";
import api from "../axios.ts";
import axios from "axios";

type FriendRequest = {
  id: string; // friendship id
  requesterName: string;
  requesterImage?: string | null;
};

async function fetchSidebar(): Promise<SidebarType> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/users/sidebar`, { withCredentials: true });
  return res.data;
}

async function fetchRequests(): Promise<FriendRequest[]> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/f/requests/incoming`, { withCredentials: true });
  return res.data;
}

function CommunityList({ title, items }: { title: string; items: SidebarType["ownedCommunities"] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>

      {items?.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <Link to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot" }} className="flex items-center gap-2 min-w-0">
                <img className="w-8 h-8 rounded-full object-cover" src={c.image ? getFromCdn(c.image) : "/avatar.png"} alt="" />
                <span className="truncate text-sm">{c.name}</span>
              </Link>

              <span className="text-xs opacity-70 tabular-nums">{c.postsCount}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs opacity-70">Nothing here yet.</p>
      )}
    </div>
  );
}

export default function Sidebar() {
  const qc = useQueryClient();

  const sidebarQ = useQuery({
    queryKey: ["sidebar"],
    queryFn: fetchSidebar,
    staleTime: 60_000,
    retry: false,
  });

  const blocked = axios.isAxiosError(sidebarQ.error) && (sidebarQ.error.response?.status === 401 || sidebarQ.error.response?.status === 403);

  const reqQ = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchRequests,
    enabled: !blocked,
    staleTime: 30_000,
    retry: false,
  });

  async function accept(id: string) {
    await api.post(`${import.meta.env.VITE_API_URL}/f/accept/${id}`, null, { withCredentials: true });
    qc.invalidateQueries({ queryKey: ["sidebar"] });
    qc.invalidateQueries({ queryKey: ["friendRequests"] });
  }

  async function decline(id: string) {
    await api.post(`${import.meta.env.VITE_API_URL}/f/decline/${id}`, null, { withCredentials: true });
    qc.invalidateQueries({ queryKey: ["friendRequests"] });
  }

  if (blocked) {
    return (
      <aside className="card lg:sticky lg:top-20 h-fit">
        <p className="text-sm font-semibold">Sidebar</p>
        <p className="text-xs opacity-70 mt-1">Log in to see your communities and friends.</p>
      </aside>
    );
  }

  if (sidebarQ.isLoading) {
    return (
      <aside className="card lg:sticky lg:top-20 h-fit">
        <p className="text-sm font-semibold">Loading...</p>
      </aside>
    );
  }

  if (!sidebarQ.data) {
    return (
      <aside className="card lg:sticky lg:top-20 h-fit">
        <p className="text-sm font-semibold">Sidebar</p>
        <p className="text-xs opacity-70 mt-1">Failed to load.</p>
      </aside>
    );
  }

  const sidebar = sidebarQ.data;

  return (
    <aside className="card lg:sticky lg:top-20 h-fit">
      <CommunityList title="Owned" items={sidebar.ownedCommunities ?? []} />
      <hr className="my-2 opacity-30" />
      <CommunityList title="Member of" items={sidebar.memberCommunities ?? []} />

      <hr className="my-2 opacity-30" />

      <div>
        <p className="text-sm font-semibold">Friends</p>

        {/* requests inside Friends */}
        {reqQ.data?.length ? (
          <div className="mt-2">
            <p className="text-xs opacity-70 mb-1">Requests</p>

            <ul className="space-y-2">
              {reqQ.data.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img className="w-7 h-7 rounded-full object-cover" src={r.requesterImage ? getFromCdn(r.requesterImage) : "/avatar.png"} alt="" />
                    <span className="text-sm truncate">{r.requesterName}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="btn primary px-2 py-1 text-xs" onClick={() => accept(r.id)}>
                      Accept
                    </button>
                    <button className="btn px-2 py-1 text-xs" onClick={() => decline(r.id)}>
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <hr className="my-2 opacity-30" />
          </div>
        ) : null}

        {sidebar.friends?.length ? (
          <ul className="mt-2 space-y-2">
            {sidebar.friends.map((f) => (
              <li key={f.id} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${f.online ? "bg-green-500" : "bg-gray-500"}`} />
                <span className="text-sm truncate">{f.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs opacity-70">{sidebar.chatComingSoon ? "Chat coming soon" : "No friends yet."}</p>
        )}
      </div>
    </aside>
  );
}
