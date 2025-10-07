import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { queryClient } from "../main.tsx";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { PostType } from "../types.ts";
import Post from "../components/Post.tsx";
import Loader from "../components/Loader.tsx";

const fetchPosts = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/p`, {
    withCredentials: true,
  });
  return res.data;
};

export const Route = createFileRoute("/")({
  loader: async () => {
    await queryClient.ensureQueryData({
      queryKey: ["posts"],
      queryFn: fetchPosts,
    });
  },
  component: Index,
  validateSearch: (search: { posts?: "new" | "hot" | "best" }) => {
    return {
      posts: search.posts ?? "hot",
    };
  },
});

function Index() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const active = search.posts;

  const { data, isLoading, error } = useQuery<PostType[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <Loader />;
  if (error || !data) {
    navigate({ to: "/error", search: { message: "Nothing were found" } });
    return;
  }

  return (
    <div className="resp-grid p-2 gap-2">
      <div className="flex justify-evenly lg:flex-col lg:justify-start place-items-end text-right gap-2">
        <button onClick={() => navigate({ to: "/", search: { posts: "new" } })} className={`btn border-none text-left p-2 w-24 ${active === "new" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          New
        </button>
        <button onClick={() => navigate({ to: "/", search: { posts: "hot" } })} className={`btn border-none text-left p-2 w-24 ${active === "hot" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          Hot
        </button>
        <button onClick={() => navigate({ to: "/", search: { posts: "best" } })} className={`btn border-none text-left p-2 w-24 ${active === "best" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          Best
        </button>
      </div>
      <section className="card">
        <ul>
          {data?.length > 0 ? (
            data?.map((post) => (
              <li key={post.id}>
                <Post {...post} />
              </li>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <img className="w-80 h-80" src="/sad.png" />
              <p className="p-4 text-center text-gray-300">No posts were found.</p>
            </div>
          )}
        </ul>
      </section>
    </div>
  );
}
