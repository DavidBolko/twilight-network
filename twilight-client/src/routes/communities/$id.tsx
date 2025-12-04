import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import type { Community } from "../../types.ts";
import { queryClient } from "../../main.tsx";
import { getFromCdn } from "../../utils.ts";
import { useUser } from "../../userContext.tsx";

import Post from "../../components/Post.tsx";
import CreatePostModal from "../../components/CreatePostModal.tsx";
import { PostFilterTabs } from "../../components/PostFilterTabs.tsx";

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
  const [isOpen, setIsOpen] = useState(false);

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

  const handlePost = () => {
    if (!user) return navigate({ to: "/auth/login" });
    setIsOpen(true);
  };

  if (!data) return <p>Error</p>;

  const isMember = user && data.members.some((m: any) => m.id === user.id);

  return (
    <div className="resp-grid p-2">
      {user && <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} communityId={data.id} />}

      <PostFilterTabs to="/communities/$id" params={{ id }} />

      {data.posts.length ? (
        <ul className="card min-h-screen">
          {data.posts.map((post) => (
            <li className="w-full" key={post.id}>
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

      <div className="card row-start-2 lg:col-start-3 lg:row-start-1 h-fit min-w-0">
        <div className="flex p-2 gap-3">
          <img src={data.imageUrl ? getFromCdn(data.imageUrl) : data.imageUrl} className="w-24 h-24 rounded-full object-cover" alt={data.name} />

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
              <h1 className="text-xl font-semibold">{data.name}</h1>
              <div className="flex gap-2 mt-1">
                <button onClick={handlePost} className="btn">
                  Post
                </button>
                <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`}>
                  {isMember ? "Leave" : "Join"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 min-w-0">
          <p className="text-sm text-justify break-words whitespace-pre-wrap">{data.description}</p>
        </div>
      </div>
    </div>
  );
}

export default CommunityComponent;
