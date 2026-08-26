import { createFileRoute, ErrorComponent, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { userSearchSchema } from "../../../schemas";
import { queryClient } from "../../../main";
import { api } from "../../../api";
import { useInfiniteScroll, useUser } from "../../../hooks";
import type { CommunityType, PostType, User } from "../../../types";
import Loader from "../../../components/Loader";
import { UserProfile } from "../../../components/UserProfile";
import Post from "../../../components/Post";
import CommunityCard from "../../../components/CommunityCard";

const PAGE_SIZE = 10;
const categories = ["Posts", "Communities", "Saved"] as const;

export const Route = createFileRoute("/_main/user/$id")({
  validateSearch: (search) => userSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps: { search } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["user", params.id],
      queryFn: () => api.get(`users/${params.id}`),
    });

    await queryClient.ensureQueryData({
      queryKey: ["isFriend", params.id],
      queryFn: () => api.get(`friendship/${params.id}`),
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
  const { id } = useParams({ from: "/_main/user/$id" });
  const navigate = useNavigate({ from: "/_main/user/$id" });
  const search = useSearch({ from: "/_main/user/$id" });
  const currentUser = useUser();

  const { data: userData } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => api.get(`users/${id}`),
  });

  const { data: isFriend } = useQuery<boolean>({
    queryKey: ["isFriend", id],
    queryFn: () => api.get(`friendship/${id}`),
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

  const savedQ = useInfiniteQuery<PostType[]>({
    queryKey: ["user-saved", id],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => api.get(`posts?saved=true&page=${pageParam}&size=${PAGE_SIZE}`),
    getNextPageParam: (lastPage, allPages) => (lastPage?.length === PAGE_SIZE ? allPages.length : undefined),
    enabled: search.tab === "Saved",
  });

  const activeQuery = search.tab === "Posts" ? postsQ : search.tab === "Communities" ? commsQ : savedQ;
  const scrollRef = useRef(null);
  useInfiniteScroll(scrollRef, activeQuery?.fetchNextPage ?? (() => {}), activeQuery?.hasNextPage ?? false, activeQuery?.isFetchingNextPage ?? false);

  if (!userData) {
    return (
      <div className="pt-64">
        <Loader />
      </div>
    );
  }

  const posts = postsQ.data?.pages.flat() ?? [];
  const communities = commsQ.data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0">
      {userData &&
        <UserProfile data={userData} isFriend={isFriend ?? false} />
      }
      <nav className="flex ">
        {categories.map((cat) => (
          <button key={cat} onClick={() => navigate({ search: (prev) => ({ ...prev, tab: cat }) })} className={`flex-1 py-3 text-sm font-semibold border-b-2 border-tw-border transition-all ${search.tab === cat ? "text-tw-primary border-b-2 border-tw-primary" : "text-tw-muted hover:text-tw-primary"}`}>
            {cat}
          </button>
        ))}
      </nav>

      <section className="base">
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
            {posts.length == 0 && <p className="p-8 text-center text-tw-muted italic text-sm">No posts yet.</p>}
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

        {search.tab === "Saved" && (
          <>
            {savedQ.data?.pages.flat().map((post) => (
              <div key={post.id} className="border-b border-tw-border hover:bg-white/5 transition-colors">
                <Post {...post} />
              </div>
            ))}
            {savedQ.isFetchingNextPage && (
              <div className="py-8">
                <Loader />
              </div>
            )}
            {(savedQ.data?.pages.flat().length ?? 0) === 0 && !savedQ.isLoading && <p className="p-8 text-center text-tw-muted italic text-sm">No saved posts yet.</p>}
          </>
        )}
      </section>
    </div>
  );
}

export default UserRoute;
