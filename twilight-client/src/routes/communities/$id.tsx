import { createFileRoute, useParams, useSearch } from "@tanstack/react-router";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { useEffect } from "react";

import type { Community, PostType } from "../../types.ts";
import { getFromCdn } from "../../utils.ts";
import { useUser } from "../../userContext.tsx";

import Post from "../../components/Post.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";
import CreatePost from "../../components/CreatePost.tsx";
import api from "../../axios.ts";
import Loader from "../../components/Loader.tsx";
import ErrorComponent from "../../components/ErrorComponent.tsx";

type Sort = "new" | "hot" | "best";

export const Route = createFileRoute("/communities/$id")({
  component: CommunityComponent,
  errorComponent: ErrorComponent,
  validateSearch: (search: { posts?: Sort }) => ({ posts: search.posts ?? "hot" }),
});

const PAGE_SIZE = 10;

const fetchCommunity = async (id: string) => {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/c/${id}`, { withCredentials: true });
  return res.data as Community;
};

const fetchCommunityPostsPage = async (communityId: string, sort: Sort, page: number) => {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/p`, {
    withCredentials: true,
    params: { communityId, posts: sort, page, size: PAGE_SIZE },
  });
  return res.data as PostType[];
};

function CommunityComponent() {
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

  const handleJoin = async () => {
    await api.put(`${import.meta.env.VITE_API_URL}/c/join/${data?.id}`, {}, { withCredentials: true });
    communityQ.refetch();
  };

  if (communityQ.isLoading || postsQ.isLoading) return (
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
            onPosted={() => {
              communityQ.refetch();
              postsQ.refetch();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {posts.length ? (
            <ul className="panel p-0">
              {posts.map((post) => (
                <li className="card" key={post.id}>
                  <Post {...post} />
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

        {/* RIGHT: community info */}
        <aside className="lg:col-start-3 lg:sticky h-fit order-1">
          <div className="card h-fit">
            <div className="panel flex-row">
              <img src={data.imageUrl ? getFromCdn(data.imageUrl) : data.imageUrl} className="w-16 h-16 rounded-full object-cover" alt={`${data.name} avatar`} />

              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">{data.name}</h1>
                <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`} aria-pressed={!!isMember}>
                  {isMember ? "Leave" : "Join"}
                </button>
              </div>
            </div>

            <div className="panel flex-col divider-top rounded-none">
              <div className="panel flex-row">
                <div className="card">
                  <p className="text-xs text-tw-light-muted dark:text-tw-muted">Members</p>
                  <p className="text-lg font-semibold">{data.members?.length ?? 0}</p>
                </div>
                <div className="card">
                  <p className="text-xs">Posts</p>
                  <p className="text-lg font-semibold">{data.postCount ?? 0}</p>
                </div>
              </div>

              <div>
                <p className="text-xs mb-1">About</p>
                <p className="text-sm text-justify break-words whitespace-pre-wrap">{data.description}</p>
              </div>

              <div>
                <p className="text-xs mb-1">Rules</p>
                <ul className="text-sm list-disc pl-4">
                  <li>Be respectful.</li>
                  <li>No spam or self-promo.</li>
                  <li>Stay on topic.</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CommunityComponent;
