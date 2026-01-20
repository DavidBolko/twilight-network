import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import type { PostType, Sort, TimeRange } from "../types.ts";
import Post from "../components/Post.tsx";
import { PostFilterTabs } from "../components/PostFilterTabs.tsx";
import Loader from "../components/Loader.tsx";
import api from "../axios.ts";

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: { posts?: Sort; time?: TimeRange }) => ({
    posts: search.posts ?? "hot",
    time: search.time ?? "all",
  }),
});

const PAGE_SIZE = 10;

const fetchPostsPage = async (sort: Sort, time: TimeRange, page: number) => {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/p`, {
    withCredentials: true,
    params: { sort, time, page, size: PAGE_SIZE },
  });
  return res.data as PostType[];
};

function Index() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const activeSort = search.posts;
  const activeTime = search.time;

  const postsQ = useInfiniteQuery({
    queryKey: ["posts", activeSort, activeTime],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPostsPage(activeSort, activeTime, pageParam),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  useEffect(() => {
    const onScroll = () => {
      //sme 600px od konca obrazovky po scrolle
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;

      if (nearBottom && postsQ.hasNextPage && !postsQ.isFetchingNextPage) {
        postsQ.fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [postsQ.hasNextPage, postsQ.isFetchingNextPage, postsQ.fetchNextPage, postsQ]);

  if (postsQ.isLoading)
    return (
      <div className="mt-64">
        <Loader />
      </div>
    );

  if (postsQ.error) {
    navigate({ to: "/error", search: { message: "Nothing were found" } });
    return null;
  }

  const posts: PostType[] = [];
  const pages = postsQ.data?.pages ?? [];
  for (const p of pages) posts.push(...p);

  return (
    <div className="center-col">
      <div className="col-start-2">
        <PostFilterTabs to="/" />
      </div>
      <main className="panel p-0 col-start-2 lg:row-start-2">
        {posts.length ? (
          <ul className="panel p-0">
            {posts.map((post) => (
              <li className="card hover:bg-tw-primary/15 transition-all" key={post.id}>
                <Post {...post} refetch={postsQ.refetch} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card min-h-screen center">
            <img className="w-72 h-72 opacity-80" src="/sad.png" alt="No posts" />
            <p className="text-tw-light-muted dark:text-tw-muted text-center">No posts were found.</p>
          </div>
        )}

        {postsQ.isFetchingNextPage ? (
          <div className="pt-64">
            <Loader />
          </div>
        ) : (
          ""
        )}
      </main>
    </div>
  );
}

export default Index;
