import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import type { Community, User } from "../types";
import { getFromCdn } from "../utils";
import api from "../axios";
import { SearchInput } from "./SearchInput";
import { Link } from "@tanstack/react-router";

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim();
  const enabled = q.length > 0;

  const [comQ, userQ] = useQueries({
    queries: [
      {
        queryKey: ["search-communities", q],
        enabled,
        queryFn: async () => (await api.get<Community[]>(`${import.meta.env.VITE_API_URL}/c`, { params: { query: q }, withCredentials: true })).data,
      },
      {
        queryKey: ["search-users", q],
        enabled,
        queryFn: async () => (await api.get<User[]>(`${import.meta.env.VITE_API_URL}/users/search`, { params: { query: q }, withCredentials: true })).data,
      },
    ],
  });

  const communities = comQ.data ?? [];
  const users = userQ.data ?? [];
  const hasResults = communities.length > 0 || users.length > 0;

  useEffect(() => {
    if (enabled && hasResults) setOpen(true);
  }, [enabled, hasResults]);

  return (
    <div className="relative">
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && enabled && hasResults ? (
        <div className="card absolute w-full h-[400px] overflow-y-scroll top-10 flex-col p-4">
          <ul className="flex flex-col gap-4">
            {communities.length ? (
              <>
                <p className=" text-tw-light-muted dark:text-tw-muted">Communities</p>
                {communities.map((c) => (
                  <li key={`com-${c.id}`}>
                    <Link to="/communities/$id" search={{ posts: "hot" }} params={{ id: String(c.id) }} className="flex gap-2 items-center hover:opacity-90" onClick={() => setOpen(false)}>
                      <img src={c.imageUrl ? getFromCdn(c.imageUrl) : "/anonymous.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <p className="truncate">{c.name}</p>
                    </Link>
                  </li>
                ))}
              </>
            ) : null}

            {users.length ? (
              <>
                {communities.length ? <hr className="divider-top my-1" /> : null}
                <p className="text-tw-light-muted dark:text-tw-muted">Users</p>
                {users.map((u) => (
                  <li key={`user-${u.id}`}>
                    <Link to="/user/$id" params={{ id: String(u.id) }} className="flex gap-2 items-center hover:opacity-90" onClick={() => setOpen(false)}>
                      <img src={u.image ? getFromCdn(u.image) : "/anonymous.png"} className="w-8 h-8 rounded-full object-cover" alt="" />
                      <p className="truncate">{u.name}</p>
                    </Link>
                  </li>
                ))}
              </>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
