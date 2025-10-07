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
  const search = useSearch({ from: "/communities/$id" });
  const activeTab = search.posts;

  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const { data, refetch } = useQuery<Community>({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
    staleTime: 60 * 1000,
  });

  const tabs: ("new" | "hot" | "best")[] = ["new", "hot", "best"];
  const changeTab = (tab: "new" | "hot" | "best") => navigate({ to: "/communities/$id", params: { id }, search: { posts: tab } });

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
      {/* Modalne okno na vytvorenie postu */}
      {user && <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} communityId={data.id} />}

      <PostFilterTabs to="/communities/$id" params={{ id }} />

      {/* Posty */}
      <ul className="card w-full">
        {data.posts.length ? (
          data.posts.map((post) => (
            <li key={post.id}>
              <Post {...post} />
            </li>
          ))
        ) : (
          <div className="container center">
            <img className="w-72 h-72 opacity-80" src="/sad.png" alt="No posts" />
            <p className=" text-gray-400">This community has no posts yet.</p>
          </div>
        )}
      </ul>

      {/* Informacie o komunite */}
      <div className="card row-start-2 lg:col-start-3 lg:row-start-1 h-fit">
        <div className="flex p-2">
          <img src={data.imageUrl ? getFromCdn(data.imageUrl) : "/com" + (Math.floor(Math.random() * 3) + 1) + ".png"} className="w-24 h-24 rounded-full object-cover" alt={data.name} />
          <div>
            <h1 className="text-xl font-semibold">{data.name}</h1>
            <div className="container flex-row gap-1 mt-1">
              <button onClick={handlePost} className="btn">
                Post
              </button>
              <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`}>
                {isMember ? "Leave" : "Join"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-justify text-sm">{data.description}</p>
      </div>
    </div>
  );
}

export default CommunityComponent;
