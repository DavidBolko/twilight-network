import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { queryClient } from "../../main";
import { api } from "../../api";
import { useUser } from "../../userContext"; // Import tvojho user hooku
import { UserProfile } from "../../components/UserProfile";
import Post from "../../components/Post";
import CommunityCard from "../../components/CommunityCard";
import Loader from "../../components/Loader";
import ErrorComponent from "../../components/ErrorComponent";

import type { PostType, CommunityType, User } from "../../types";
import { userSearchSchema } from "../../schemas";

const PAGE_SIZE = 10;
const categories = ["Posts", "Communities", "Saved"] as const;

export const Route = createFileRoute("/user/$id")({
  validateSearch: (search) => userSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps: { search } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["user", params.id],
      queryFn: () => api.get(`users/${params.id}`),
    });

    if (search.tab === "Posts") {
      await queryClient.ensureInfiniteQueryData({
        queryKey: ["user-posts", params.id],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => api.get(`posts?authorId=${params.id}&page=${pageParam}&size=${PAGE_SIZE}`),
      });
    } else if (search.tab === "Communities") {
      await queryClient.ensureInfiniteQueryData({
        queryKey: ["user-communities", params.id],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => api.get(`communities?userId=${params.id}&page=${pageParam}&size=${PAGE_SIZE}`),
      });
    }
  },
  errorComponent: ErrorComponent,
  component: UserRoute,
});

function UserRoute() {
  const { id } = useParams({ from: "/user/$id" });
  const navigate = useNavigate({ from: "/user/$id" });
  const search = useSearch({ from: "/user/$id" });
  const currentUser = useUser();

  const { data: userData } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => api.get(`users/${id}`),
  });

  const postsQ = useInfiniteQuery<PostType[]>({
    queryKey: ["user-posts", id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`posts?authorId=${id}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: search.tab === "Posts",
  });

  const commsQ = useInfiniteQuery<CommunityType[]>({
    queryKey: ["user-communities", id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`communities?userId=${id}&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: search.tab === "Communities",
  });

  useEffect(() => {
    const activeQuery = search.tab === "Posts" ? postsQ : search.tab === "Communities" ? commsQ : null;
    if (!activeQuery) return;

    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
      if (nearBottom && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
        activeQuery.fetchNextPage();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [postsQ, commsQ, search.tab]);

  if (!userData)
    return (
      <div className="pt-64">
        <Loader />
      </div>
    );

  const posts = postsQ.data?.pages.flat() ?? [];
  const communities = commsQ.data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0">
      <UserProfile data={userData} />

      <nav className="flex border-b border-tw-border">
        {categories.map((cat) => (
          <button key={cat} onClick={() => navigate({ search: (prev) => ({ ...prev, tab: cat }) })} className={`flex-1 py-3 text-sm font-semibold transition-all ${search.tab === cat ? "text-tw-primary border-b-2 border-tw-primary" : "text-tw-muted hover:text-tw-primary"}`}>
            {cat}
          </button>
        ))}
      </nav>

      <main className="flex flex-col">
        {search.tab === "Posts" && (
          <>
            {posts.map((post) => (
              <div key={post.id} className="border-b border-tw-border hover:bg-white/5 transition-colors">
                <Post {...post} />
              </div>
            ))}
            {postsQ.isFetchingNextPage && (
              <div className="py-8">
                <Loader />
              </div>
            )}
          </>
        )}

        {search.tab === "Communities" && (
          <>
            <div className="grid">
              {communities.map((com) => (
                <CommunityCard key={com.id} community={com} currentUserId={currentUser?.id} />
              ))}
            </div>
            {commsQ.isFetchingNextPage && (
              <div className="py-8">
                <Loader />
              </div>
            )}
          </>
        )}

        {search.tab === "Saved" && <p className="p-8 text-center text-tw-muted italic text-sm">Saved posts coming soon...</p>}
      </main>
    </div>
  );
}

export default UserRoute;
