import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Grid2X2, User, Users } from "lucide-react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { exploreSearchSchema } from "../../schemas";
import { useDebounce, useInfiniteScroll } from "../../hooks";
import type { CommunityType, PostType } from "../../types";
import { api } from "../../api";
import type { User as AppUser } from "../../types";
import { SearchInput } from "../../components/SearchInput";
import Post from "../../components/Post";
import { NothingFound } from "../../components/Errors/NothingFound";
import { getFromCdn } from "../../utils";
import UserCard from "../../components/UserCard";
const PAGE_SIZE = 10;

const tabs = [
  { icon: <Grid2X2 />, name: "Posts" },
  { icon: <Users />, name: "Communities" },
  { icon: <User />, name: "Users" },
];

export const Route = createFileRoute("/_main/explore")({
  validateSearch: (search) => exploreSearchSchema.parse(search),
  component: ExplorePage,
  errorComponent: ErrorComponent,
});


function ExplorePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [queryString, setQueryString] = useState("");
  const query = useDebounce(queryString);

  const postsQ = useInfiniteQuery<PostType[]>({
    queryKey: ["posts-explore", query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`posts?query=${query}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: activeTab === 0,
    placeholderData: keepPreviousData,
  });
  const comsQ = useInfiniteQuery<CommunityType[]>({
    queryKey: ["communities-explore", query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`communities?name=${query}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: activeTab === 1,
    placeholderData: keepPreviousData,
  });
  const peopleQ = useInfiniteQuery<AppUser[]>({
    queryKey: ["users-explore", query],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`users?userName=${query}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: activeTab === 2,
    placeholderData: keepPreviousData,
  });

  const activeQ = { 0: postsQ, 1: comsQ, 2: peopleQ }[activeTab] ?? postsQ;
  const posts = postsQ.data?.pages.flat() ?? [];
  const coms = comsQ.data?.pages.flat() ?? [];
  const people = peopleQ.data?.pages.flat() ?? [];

  const scrollRef = useRef(null);
  useInfiniteScroll(scrollRef, activeQ.fetchNextPage, activeQ.hasNextPage ?? false, activeQ.isFetchingNextPage);

  return (
    <div className="card min-h-screen border-y-0 rounded-none p-0 gap-0">
      <h1 className="text-xl p-2">Explore</h1>

      <div className="p-2">
        <SearchInput onChange={setQueryString} value={queryString} />
      </div>

      <div className="flex items-center h-12 border-y border-tw-light-border dark:border-tw-border bg-tw-light-surface/50 dark:bg-tw-surface/50 backdrop-blur-sm sticky top-0 z-10">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveTab(index)}
            className={`flex items-center justify-center gap-1.5 h-full w-full text-sm transition-colors
              ${index === activeTab ? "text-tw-primary bg-tw-primary/20 font-bold" : "text-tw-muted hover:text-tw-light-text dark:hover:text-tw-text"}`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>

      <ul className="flex flex-col divide-y divide-tw-light-border dark:divide-tw-border">
        {activeTab === 0 &&
          (posts.length > 0 ? (
            posts.map((p) => (
              <li key={p.id}>
                <Post {...p} />
              </li>
            ))
          ) : (
            <NothingFound message="No posts found." />
          ))}

        {activeTab === 1 &&
          (coms.length > 0 ? (
            coms.map((c) => (
              <li key={c.id}>
                <Link to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot", time: "month" }} className="card-interactive items-center gap-3 p-4">
                  <img src={c.image ? getFromCdn(c.image) : "/avatar.png"} alt="" className="avatar size-10" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.description && <p className="text-xs opacity-70 line-clamp-1">{c.description}</p>}
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <NothingFound message="No communities found." />
          ))}

        {activeTab === 2 &&
          (people.length > 0 ? (
            people.map((u) => (
              <li key={u.id}>
                <UserCard {...u} />
              </li>
            ))
          ) : (
            <NothingFound message="No users found." />
          ))}

        <div ref={scrollRef} />
      </ul>
    </div>
  );
}
