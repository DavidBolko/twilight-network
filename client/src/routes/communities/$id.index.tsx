import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { queryClient } from "../../main.tsx";
import type { PostType, CommunityType } from "../../types.ts";
import { useUser } from "../../userContext.tsx";
import { api } from "../../api.ts";
import { searchSchema } from "../../schemas.ts";

import Post from "../../components/Post.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";
import CreatePost from "../../components/CreatePost.tsx";
import Loader from "../../components/Loader.tsx";
import ErrorComponent from "../../components/ErrorComponent.tsx";
import CommunityHeader from "../../components/CommunityHeader.tsx";
import { useInfiniteScroll } from "../../hooks.tsx";

const PAGE_SIZE = 10;

const fetchCommunityPosts = async (id: string, sort: string, time: string, page: number): Promise<PostType[]> => {
  return api.get(`posts?communityId=${id}&sort=${sort}&time=${time}&page=${page}&size=${PAGE_SIZE}`);
};

export const Route = createFileRoute("/communities/$id/")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { posts, time } }) => ({ posts, time }),
  loader: async ({ params: { id }, deps: { posts, time } }) => {
    await Promise.all([
      queryClient.ensureQueryData({
        queryKey: ["community", id],
        queryFn: () => api.get(`communities/${id}`),
      }),
      queryClient.ensureInfiniteQueryData({
        queryKey: ["community-posts", id, posts, time],
        initialPageParam: 0,
        queryFn: ({ pageParam }) => fetchCommunityPosts(id, posts, time, pageParam),
      }),
    ]);
  },
  component: CommunityPage,
  errorComponent: ErrorComponent,
});

function CommunityPage() {
  const { id } = useParams({ from: "/communities/$id" });
  const navigate = useNavigate({ from: "/communities/$id" });
    const { posts: activeSort, time: activeTime } = Route.useSearch();
    const user = useUser();

  const { data: community } = useQuery<CommunityType>({
    queryKey: ["community", id],
    queryFn: () => api.get(`communities/${id}`),
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["community-posts", id, activeSort, activeTime],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchCommunityPosts(id, activeSort, activeTime, pageParam),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  const scrollRef = useRef(null);
  useInfiniteScroll(scrollRef, fetchNextPage, hasNextPage, isFetchingNextPage)

  if (!community) {
    return (
      <div className="pt-64">
        <Loader />
      </div>
    );
  }
  const posts = data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0 p-0">
      <CommunityHeader community={community} me={user} />

      <div className="border-b border-tw-light-border dark:border-tw-border p-4">
        <CreatePost />
      </div>
      <PostFilterTabs activeSort={activeSort} activeTime={activeTime} onChange={(sort, time) => navigate({ search: { posts: sort, time } })} />

      <main className="flex-1">
        {posts.length > 0 ? (
          <div className="flex flex-col">
            {posts.map((post) => (
              <div key={post.id} className="border-b border-tw-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Post {...post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <img className="w-48 h-48 opacity-50 grayscale" src="/sad.png" alt="No posts" />
            <p className="text-tw-muted">No posts found in this community.</p>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="py-8">
            <Loader />
          </div>
        )}
      </main>
    </div>
  );
}
