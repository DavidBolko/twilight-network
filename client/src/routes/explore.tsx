import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getFromCdn } from "../utils";
import { Grid2X2, SearchIcon, Users } from "lucide-react";
import Loader from "../components/Loader";
import type { CommunityType } from "../types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api";

const tabs = [
  { icon: <Grid2X2 />, name: "Posts" },
  { icon: <Users />, name: "Communities" },
];
const PAGE_SIZE = 10;

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  errorComponent: ErrorComponent,
});

const fetchComs = async (queryString: string, page: number): Promise<CommunityType[]> => {
  return api.get(`communities?name=${queryString}&page=${page}&size=${PAGE_SIZE}`);
};

function ExplorePage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(0);
  const [queryString, setQueryString] = useState("");

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery<CommunityType[]>({
    queryKey: ["communities-explore", queryString],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchComs(queryString, pageParam as number),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
      if (nearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const coms = data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0 p-0 gap-0">
      <div className="">
        <div className="p-4">
          <div className="input-wrap">
            <SearchIcon className="input-icon" />
            <input className="form-input" onChange={(e) => setQueryString(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center h-12 border-y border-tw-light-border dark:border-tw-border bg-tw-light-surface/50 dark:bg-tw-surface/50 backdrop-blur-sm sticky top-0 z-10">
          {tabs.map((c, index) => {
            const active = index === activeCategoryId;
            return (
              <button key={index} onClick={() => setActiveCategoryId(index)} className={`flex self-center justify-center items-center gap-1.5 h-full w-full transition-colors ${active ? "text-tw-primary-dark bg-tw-primary/20 dark:text-tw-primary font-bold" : "text-tw-muted hover:text-tw-light-text dark:hover:text-tw-text"}`} type="button">
                {c.icon} {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? <span className="pt-24"><Loader /></span> : null}

      {!isLoading && (
        <div className="flex flex-col gap-2">
          {coms.length > 0 ? (
            coms.map((c) => {
              const img = c.image ?? c.image ?? null;
              return (
                <Link key={c.id} to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot", time: "month" }} className="panel p-4 flex-row items-center gap-3 hover:bg-tw-primary/10">
                  <img src={img ? getFromCdn(img) : "/avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.description ? <p className="text-xs opacity-70 line-clamp-1">{c.description}</p> : null}
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm opacity-70">No communities found.</p>
          )}
        </div>
      )}
    </div>
  );
}
