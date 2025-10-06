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
    <div className="lg:resp-grid p-2 gap-2 min-h-full bg-tw-surface lg:bg-transparent">
      {/* Modalne okno na vytvorenie postu */}
      {user && <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} communityId={data.id} />}

      {/* Filtrovanie postov */}
      <div className="flex justify-evenly lg:flex-col lg:justify-start place-items-end row-start-1 text-right gap-2">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => changeTab(tab)} className={`btn border-none text-left p-2 w-24 ${activeTab === tab ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Informacie o komunite */}
      <div className="flex flex-col col-start-3 gap-2 card h-fit p-4">
        <div className="flex gap-2 items-center">
          <img src={getFromCdn(data.imageUrl)} className="w-24 h-24 rounded-full object-cover" alt={data.name} />
          <div>
            <h1 className="text-xl font-semibold">{data.name}</h1>
            <div className="flex gap-1 mt-1">
              <button onClick={handlePost} className="btn">
                Post
              </button>
              <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`}>
                {isMember ? "Leave community" : "Join community"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-justify text-sm">{data.description}</p>
      </div>

      {/* Posty */}
      <ul className="flex flex-col gap-1 row-start-1 col-start-2 bg-tw-surface rounded-md min-h-screen">
        {data.posts.length ? (
          data.posts.map((post) => (
            <li key={post.id}>
              <Post {...post} />
            </li>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <img className="w-72 h-72 opacity-80" src="/sad.png" alt="No posts" />
            <p className="p-4 text-center text-gray-400">This community has no posts yet.</p>
          </div>
        )}
      </ul>
    </div>
  );
}

export default CommunityComponent;
