import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect } from "react";

import type { Community, PostType } from "../../types.ts";
import { useUser } from "../../userContext.tsx";

import Post from "../../components/Post.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";
import CreatePost from "../../components/CreatePost.tsx";
import api from "../../axios.ts";
import Loader from "../../components/Loader.tsx";
import ErrorComponent from "../../components/ErrorComponent.tsx";
import CommunityInfoPanel from "../../components/CommunityInfoPanel.tsx";

type Sort = "new" | "hot" | "best";

export const Route = createFileRoute("/communities/$id")({
  component: CommunityComponent,
  errorComponent: ErrorComponent,
  validateSearch: (search: { posts?: Sort }) => ({ posts: search.posts ?? "hot" }),
});

const PAGE_SIZE = 10;

const fetchCommunity = async (id: string) => {
  const res = await api.get(`/c/${id}`);
  return res.data as Community;
};

const fetchCommunityPostsPage = async (communityId: string, sort: Sort, page: number) => {
  const res = await api.get(`/p`, {
    params: { communityId, sort, page, size: PAGE_SIZE },
  });
  return res.data as PostType[];
};

function CommunityComponent() {
  const queryClient = useQueryClient();
  const { id } = useParams({ strict: false }) as { id: string };
  const { posts: sort } = useSearch({ from: "/communities/$id" });
  const user = useUser();

  const communityQ = useQuery({
    queryKey: ["community", id],
    queryFn: () => fetchCommunity(id),
  });

  const postsQ = useInfiniteQuery({
    queryKey: ["community-posts", id, sort],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchCommunityPostsPage(id, sort, pageParam),
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length === PAGE_SIZE ? allPages.length : undefined),
  });

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;

      if (nearBottom && postsQ.hasNextPage && !postsQ.isFetchingNextPage) {
        postsQ.fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [postsQ.hasNextPage, postsQ.isFetchingNextPage, postsQ.fetchNextPage, postsQ]);

  const data = communityQ.data;

  if (communityQ.isLoading || postsQ.isLoading)
    return (
      <div className="pt-64">
        <Loader />
      </div>
    );
  if (!data) throw new Error("Community not found");

  const isMember = data.members?.some((m) => m.id === user?.id) ?? false;
  const posts: PostType[] = [];
  const pages = postsQ.data?.pages ?? [];
  for (const p of pages) posts.push(...p);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1400px] p-2 grid grid-cols-1 lg:grid-cols-[1fr_760px_360px] gap-4">
        <main className="lg:col-start-2  space-y-3 lg:order-1 order-2">
          <PostFilterTabs to="/communities/$id" params={{ id }} />

          <CreatePost
            communityId={data.id}
            onPosted={async () => {
              queryClient.removeQueries({ queryKey: ["community-posts", id, sort] });
              communityQ.refetch();
              postsQ.refetch();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {posts.length ? (
            <ul className="panel p-0">
              {posts.map((post) => (
                <li className="card" key={post.id}>
                  <Post {...post} refetch={communityQ.refetch} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card min-h-screen center">
              <img className="w-72 h-72 opacity-80" src="/sad.png" alt="No posts" />
              <p className="text-gray-400">This community has no posts yet.</p>
            </div>
          )}

          {postsQ.isFetchingNextPage ? <p className="text-center text-sm opacity-70 py-4">Loading more...</p> : null}
        </main>

        <aside className="lg:col-start-3 lg:sticky h-fit order-1">
          <CommunityInfoPanel community={data} me={user} isMember={isMember} refetchCommunity={communityQ.refetch} />
        </aside>
      </div>
    </div>
  );
}

export default CommunityComponent;
