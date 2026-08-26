import { createFileRoute, ErrorComponent, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { searchSchema } from "../../schemas";
import { api } from "../../api";
import { queryClient } from "../../main";
import { useInfiniteScroll } from "../../hooks";
import CreatePost from "../../components/CreatePost";
import { PostFilterTabs } from "../../components/PostFilterTabs";
import Post from "../../components/Post";
import { NothingFound } from "../../components/Errors/NothingFound";
import Loader from "../../components/Loader";
import type { PostType } from "../../types";


type Search = z.infer<typeof searchSchema>;

const PAGE_SIZE = 10;

const fetchPostsPage = async (sort: Search["posts"], time: Search["time"], page: number): Promise<PostType[]> => {
  return api.get(`posts?sort=${sort}&time=${time}&page=${page}&size=${PAGE_SIZE}`);
};

export const Route = createFileRoute("/_main/")({
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
  const navigate = useNavigate({ from: "/_main/" });
  const { posts: activeSort, time: activeTime } = useSearch({ from: "/_main/" });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["posts", activeSort, activeTime],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPostsPage(activeSort, activeTime, pageParam),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  const scrollRef = useRef(null);
  useInfiniteScroll(scrollRef, fetchNextPage, hasNextPage, isFetchingNextPage);

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="card min-h-screen border-y-0 rounded-none p-0 gap-0">
      <h1 className="text-xl p-2">Feed</h1>

      <div className="p-4 divider-bottom">
        <CreatePost />
      </div>

      <PostFilterTabs
        activeSort={activeSort}
        activeTime={activeTime}
        onChange={(sort, time) => navigate({ search: { posts: sort, time } })}
      />

      {posts.length > 0 ? (
        <ul className="flex flex-col divide-y divide-tw-light-border dark:divide-tw-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Post {...post} />
            </li>
          ))}
        </ul>
      ) : (
        <NothingFound message="No posts found." />
      )}
      <div ref={scrollRef} className="h-px" />
      {isFetchingNextPage && <div className="py-8"><Loader /></div>}

    </div>
  );
}

export default Index;