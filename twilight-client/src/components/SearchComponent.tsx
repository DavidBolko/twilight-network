import axios from "axios";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Community } from "../types.ts";
import { getFromCdn } from "../globals.ts";

export default function SearchComponent() {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState("");

  const getSearch = async (query: string) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/c?query=${query}`, {
      withCredentials: true,
    });
    return res.data;
  };

  const { data, refetch } = useQuery<Community[]>({
    queryKey: ["search"],
    queryFn: () => getSearch(query),
    enabled: false,
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value) {
      refetch();
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      setOpen(true);
    }
  }, [data]);

  if (data) {
    return (
      <div className="flex flex-col relative ">
        <div className="group">
          <div className={`input text-sm flex items-center pl-2 pr-2 p-0 backdrop-blur-md opacity-5 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:bg-tw-surface transition-opacity duration-200 ${open ? "rounded-b-none" : ""}`}>
            <SearchIcon />
            <input onChange={(e) => handleSearch(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 100)} className="border-0 w-full focus:outline-none bg-transparent" type="text" />
          </div>
        </div>
        <div className={`card border absolute w-full top-10 rounded-t-none flex-col p-2 ${open ? "" : "hidden"}`}>
          <ul className="flex flex-col gap-4">
            {data.map((com) => (
              <li>
                <a className="flex z-50 gap-2 items-center" href={`/communities/${com.id}`}>
                  <img src={getFromCdn(com.imageUrl)} className="w-8 h-8 rounded-full object-cover" alt={com.imageUrl + "_image"} />
                  <p>{com.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col relative ">
      <div className="group">
        <div className={`input text-sm flex items-center pl-2 pr-2 p-0 backdrop-blur-lg bg-white/50 opacity-15 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-tw-surface/80 transition-opacity duration-200`}>
          <SearchIcon />
          <input onChange={(e) => handleSearch(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} className="border-0 w-full focus:outline-none bg-transparent" type="text" />
        </div>
      </div>
    </div>
  );
}
