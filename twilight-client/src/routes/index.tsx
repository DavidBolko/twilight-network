import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { queryClient } from "../main.tsx";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { PostType } from "../types.ts";
import Post from "../components/Post.tsx";

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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading posts</p>;

  return (
    <div className="resp-grid flex-col p-2 gap-2">
      <div className="flex justify-evenly lg:flex-col lg:justify-start place-items-end row-start-1 text-right gap-2">
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
      <ul className="card flex flex-col gap-1 col-start-2">
        {data?.map((post) => (
          <li key={post.id}>
            <Post text={post.title} id={post.id} title={post.title} likes={post.likes} author={post.author} communityImage={post.communityImage} communityName={post.communityName} communityId={post.communityId} images={post.images} comments={post.comments} />
          </li>
        ))}
      </ul>
    </div>
  );
}
