import { createFileRoute, Link, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

import { useEffect } from "react";

import type { Community, PostType } from "../../types.ts";
import { getFromCdn } from "../../utils.ts";
import { useUser } from "../../userContext.tsx";

import Post from "../../components/Post.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";
import CreatePostContainer from "../../components/CreatePostContainer.tsx";
import api from "../../axios.ts";

type Sort = "new" | "hot" | "best";

export const Route = createFileRoute("/communities/$id")({
  component: CommunityComponent,
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
  const navigate = useNavigate();
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

  // jednoduchý scroll listener (keď si blízko dna, fetch ďalšiu stránku)
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;

      if (nearBottom && postsQ.hasNextPage && !postsQ.isFetchingNextPage) {
        postsQ.fetchNextPage();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // ak je stránka krátka, nech sa to doplní hneď
    return () => window.removeEventListener("scroll", onScroll);
  }, [postsQ.hasNextPage, postsQ.isFetchingNextPage, postsQ.fetchNextPage]);

  const data = communityQ.data;

  const handleJoin = async () => {
    if (!user) return navigate({ to: "/auth/login" });
    await api.put(`${import.meta.env.VITE_API_URL}/c/join/${data?.id}`, {}, { withCredentials: true });
    communityQ.refetch();
  };

  if (communityQ.isLoading || postsQ.isLoading) return <p>Loading...</p>;
  if (!data) return <p>Error</p>;

  const isMember = user && data.members.some((m: any) => m.id === user.id);

  const posts: PostType[] = [];
  const pages = postsQ.data?.pages ?? [];
  for (const p of pages) posts.push(...p);

  return (
    <div className="resp-grid p-2">
      <div className="lg:col-start-1 lg:sticky lg:top-20 lg:self-start lg:justify-self-end h-fit order-1">
        <PostFilterTabs to="/communities/$id" params={{ id }} />
      </div>

      <div className="card lg:col-start-3 lg:row-start-1 lg:sticky lg:top-20 h-fit">
        <div className="container flex-row">
          <img src={data.imageUrl ? getFromCdn(data.imageUrl) : data.imageUrl} className="w-16 h-16 rounded-full object-cover" alt={`${data.name} avatar`} />

          <div>
            <h1 className="text-lg font-semibold truncate">{data.name}</h1>

            <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`} aria-pressed={!!isMember}>
              {isMember ? "Leave" : "Join"}
            </button>
          </div>
        </div>

        <div className="container flex-col divider-top rounded-none">
          <div className="container flex-row">
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

      <div className="container pt-1 lg:col-start-2 lg:row-start-1 lg:order-2 order-3">
        <div className="relative">
          {user ? (
            <CreatePostContainer
              communityId={data.id}
              onPosted={() => {
                communityQ.refetch();
                postsQ.refetch();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ) : (
            <div className="card">
              <Link to="/auth/login" className="text-sm">
                To create a post, you need to log in.
              </Link>
            </div>
          )}
        </div>

        {posts.length ? (
          <ul className="container p-0">
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
      </div>
    </div>
  );
}

export default CommunityComponent;
