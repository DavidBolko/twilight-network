import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import axios from "axios";
import type { Community } from "../../types.ts";
import CreatePostModal from "../../components/CreatePostModal.tsx";
import { useState } from "react";
import Post from "../../components/Post.tsx";
import { queryClient } from "../../main.tsx";
import { useQuery } from "@tanstack/react-query";
import { getFromCdn } from "../../globals.ts";
import { useUser } from "../../userContext.tsx";

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
  validateSearch: (search: { posts?: "new" | "hot" | "best" }) => {
    return {
      posts: search.posts ?? "hot",
    };
  },
});

function CommunityComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/communities/$id" });
  const active = search.posts;

  const user = useUser();
  const { id } = useParams({ strict: false }) as { id: string };
  const [isOpen, setIsOpen] = useState(false);

  const { data, refetch } = useQuery<Community>({
    queryKey: communityQueryKey(id),
    queryFn: () => fetchCommunity(id),
    staleTime: 60 * 1000,
  });

  const handleJoin = async () => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    await axios.put(`${import.meta.env.VITE_API_URL}/c/join/${data?.id}`, {}, { withCredentials: true });
    refetch();
  };

  const handlePost = () => {
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    setIsOpen(true);
  };

  if (!data) {
    return <p>Error</p>;
  }

  return (
    <div className="lg:resp-grid p-2 gap-2 min-h-full bg-tw-surface lg:bg-transparent">
      {user && <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} communityId={data.id} />}
      <div className="flex justify-evenly lg:flex-col lg:justify-start place-items-end row-start-1 text-right gap-2">
        <button onClick={() => navigate({ to: "/communities/$id", params: { id }, search: { posts: "new" } })} className={`btn border-none text-left p-2 w-24 ${active === "new" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          New
        </button>
        <button onClick={() => navigate({ to: "/communities/$id", params: { id }, search: { posts: "hot" } })} className={`btn border-none text-left p-2 w-24 ${active === "hot" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          Hot
        </button>
        <button onClick={() => navigate({ to: "/communities/$id", params: { id }, search: { posts: "best" } })} className={`btn border-none text-left p-2 w-24 ${active === "best" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          Best
        </button>
      </div>

      <div className="flex flex-col col-start-3 gap-2 card h-fit p-4">
        <div className="flex gap-2">
          <img src={getFromCdn(data.imageUrl)} className="w-24 h-24 rounded-full object-cover" alt={data.name} />
          <div>
            <h1 className="text-xl">{data.name}</h1>
            <div className="flex gap-1">
              <button onClick={handlePost} className="btn">
                Post
              </button>
              <button onClick={handleJoin} className="btn primary">
                {user && data.members.some((m: any) => m.id === user.id) ? "Leave community" : "Join community"}
              </button>
            </div>
          </div>
        </div>
        <p className="text-justify">Lorem ipsum, dolor sit amet consectetur adipisicing elit...</p>
      </div>

      <ul className="flex flex-col gap-1 row-start-1 col-start-2 bg-tw-surface rounded-md min-h-screen">
        {data.posts.length > 0 ? (
          data.posts.map((post) => (
            <li key={post.id}>
              <Post {...post} />
            </li>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <img className="w-80 h-80" src="/sad.png" />
            <p className="p-4 text-center text-gray-300">Táto komunita zatiaľ nemá žiadne príspevky.</p>
          </div>
        )}
      </ul>
    </div>
  );
}
