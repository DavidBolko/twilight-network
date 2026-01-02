import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Community } from "../../types.ts";
import { queryClient } from "../../main.tsx";
import { getFromCdn } from "../../utils.ts";
import { useUser } from "../../userContext.tsx";

import Post from "../../components/Post.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";
import CreatePostContainer from "../../components/CreatePostContainer.tsx";

const communityQueryKey = (id: string) => ["community", id];

const fetchCommunity = async (id: string) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/c/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const Route = createFileRoute("/communities/$id")({
  loader: async ({ params }) => {
    await queryClient.prefetchQuery({
      queryKey: communityQueryKey(params.id),
      queryFn: () => fetchCommunity(params.id),
      staleTime: 60 * 1000,
    });
    return {};
  },
  component: CommunityComponent,
  validateSearch: (search: { posts?: "new" | "hot" | "best" }) => ({
    posts: search.posts ?? "hot",
  }),
});

function CommunityComponent() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false }) as { id: string };

  const user = useUser();

  const { data, refetch } = useQuery<Community>({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const handleJoin = async () => {
    if (!user) return navigate({ to: "/auth/login" });
    await axios.put(`${import.meta.env.VITE_API_URL}/c/join/${data?.id}`, {}, { withCredentials: true });
    refetch();
  };

  if (!data) return <p>Error</p>;

  const isMember = user && data.members.some((m: any) => m.id === user.id);

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
              <p className="text-xs ">Posts</p>
              <p className="text-lg font-semibold">{data.posts?.length ?? 0}</p>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1">About</p>
            <p className="text-sm text-justify break-words whitespace-pre-wrap ">{data.description}</p>
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
            <CreatePostContainer communityId={data.id} onPosted={() => refetch()} />
          ) : (
            <div className="card">
              <Link to="/auth/login" className="text-sm">
                To create a post, you need to log in.
              </Link>
            </div>
          )}
        </div>

        {data.posts.length ? (
          <ul className="container p-0">
            {data.posts.map((post) => (
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
      </div>
    </div>
  );
}

export default CommunityComponent;
