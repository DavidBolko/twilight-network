import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { queryClient } from "../main.tsx";
import type { PostType } from "../types.ts";
import Post from "../components/Post.tsx";
import { PostFilterTabs } from "../components/PostFilterTabs.tsx";
import Loader from "../components/Loader.tsx";
import { api } from "../api.ts";
import ErrorComponent from "../components/ErrorComponent.tsx";
import CreatePost from "../components/CreatePost.tsx";
import { searchSchema } from "../schemas.ts";
import { useInfiniteScroll } from "../hooks.tsx";

type Search = z.infer<typeof searchSchema>;

const PAGE_SIZE = 10;

const fetchPostsPage = async (sort: Search["posts"], time: Search["time"], page: number): Promise<PostType[]> => {
  return api.get(`posts?sort=${sort}&time=${time}&page=${page}&size=${PAGE_SIZE}`);
};

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { posts, time } }) => ({ posts, time }),
  loader: async ({ deps: { posts, time } }) => {
    await queryClient.ensureInfiniteQueryData({
      queryKey: ["posts", posts, time],
      initialPageParam: 0,
      queryFn: ({ pageParam }) => fetchPostsPage(posts, time, pageParam),
    });
  },
  errorComponent: ErrorComponent,
});

function Index() {
  const navigate = useNavigate({ from: "/" });
  const { posts: activeSort, time: activeTime } = useSearch({ from: "/" });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts", activeSort, activeTime],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPostsPage(activeSort, activeTime, pageParam),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  const scrollRef = useRef(null);
  useInfiniteScroll(scrollRef, fetchNextPage, hasNextPage, isFetchingNextPage)
  const posts = data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0 p-0 gap-0">
      <div className="border-b border-tw-light-border dark:border-tw-border p-4">
        <CreatePost />
      </div>

      <PostFilterTabs
        activeSort={activeSort}
        activeTime={activeTime}
        onChange={(sort, time) => navigate({ search: { posts: sort, time } })}
      />

      <div className="flex-1">
        {posts.length > 0 ? (
          <ul className="flex h-auto flex-col">
            {posts.map((post) => (
              <li className="hover:bg-tw-primary/5" key={post.id}>
              <Post {...post} />
              <hr className="border-0 h-[1px] bg-tw-border/80"/>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <img className="w-48 h-48 opacity-50 grayscale" src="/sad.png" alt="No posts" />
            <p className="text-tw-muted">No posts found.</p>
          </div>
        )}
        <div ref={scrollRef} style={{ height: "1px" }} />
        {isFetchingNextPage && (
          <div className="py-8">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;