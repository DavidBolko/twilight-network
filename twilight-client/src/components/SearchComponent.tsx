import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Community, User } from "../types";
import { getFromCdn } from "../utils";
import api from "../axios";

type SearchResult = {
  communities: Community[];
  users: User[];
};

export default function SearchComponent() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const getSearch = async (q: string): Promise<SearchResult> => {
    const res = await api.get<SearchResult>(`${import.meta.env.VITE_API_URL}/search?query=${encodeURIComponent(q)}`, { withCredentials: true });
    return res.data;
  };

  const { data } = useQuery<SearchResult>({
    queryKey: ["search", query],
    queryFn: ({ queryKey }) => {
      const [, q] = queryKey as [string, string];
      return getSearch(q);
    },
    enabled: query.trim().length > 0,
  });

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  useEffect(() => {
    if (data && (data.communities.length > 0 || data.users.length > 0)) {
      setOpen(true);
    }
  }, [data]);

  const hasResults = !!data && (data.communities.length > 0 || data.users.length > 0);

  const inputNode = (
    <div className="group">
      <div className="input text-sm flex items-center pl-2 pr-2 p-0 backdrop-blur-md opacity-5 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:bg-tw-surface transition-opacity duration-200">
        <SearchIcon />
        <input onChange={(e) => handleSearch(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 100)} className="border-0 w-full focus:outline-none bg-transparent" type="text" />
      </div>
    </div>
  );

  if (hasResults) {
    return (
      <div className="flex flex-col relative">
        {inputNode}

        <div className={`card border absolute w-full top-10 rounded-t-none flex-col p-2 ${open ? "" : "hidden"}`}>
          <ul className="flex flex-col gap-4">
            {data?.communities.length ? (
              <>
                <li className="text-xs uppercase tracking-wide text-white/50 px-1">Communities</li>
                {data.communities.map((com) => (
                  <li key={`com-${com.id}`}>
                    <a className="flex z-50 gap-2 items-center" href={`/communities/${com.id}`}>
                      <img src={com.imageUrl ? getFromCdn(com.imageUrl) : "/anonymous.png"} className="w-8 h-8 rounded-full object-cover" alt={com.imageUrl + "_image"} />
                      <p>{com.name}</p>
                    </a>
                  </li>
                ))}
              </>
            ) : null}

            {data?.users.length ? (
              <>
                {data.communities.length > 0 && <hr className="border-t border-white/10 my-1" />}
                <li className="text-xs uppercase tracking-wide text-white/50 px-1">Users</li>
                {data.users.map((u) => (
                  <li key={`user-${u.id}`}>
                    <a className="flex z-50 gap-2 items-center" href={`/user/${u.id}`}>
                      <img src={u.image ? getFromCdn(u.image) : "/anonymous.png"} className="w-8 h-8 rounded-full object-cover" alt={u.name + "_avatar"} />
                      <p>{u.name}</p>
                    </a>
                  </li>
                ))}
              </>
            ) : null}
          </ul>
        </div>
      </div>
    );
  }

  // bez výsledkov – len input
  return (
    <div className="flex flex-col relative">
      <div className="group">
        <div className="input text-sm flex items-center pl-2 pr-2 p-0 backdrop-blur-lg bg-white/50 opacity-15 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-tw-surface/80 transition-opacity duration-200">
          <SearchIcon />
          <input onChange={(e) => handleSearch(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} className="border-0 w-full focus:outline-none bg-transparent" type="text" />
        </div>
      </div>
    </div>
  );
}
