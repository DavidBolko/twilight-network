import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { queryClient } from "../main.tsx";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { PostType } from "../types.ts";
import Post from "../components/Post.tsx";
import Loader from "../components/Loader.tsx";
import { PostFilterTabs } from "../components/PostFilterTabs.tsx";

type Sort = "new" | "hot" | "best";

const fetchPosts = async (sort: Sort) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/p`, {
    withCredentials: true,
    params: { posts: sort },
  });
  return res.data;
};

export const Route = createFileRoute("/")({
  loader: async ({ location }) => {
    const sort = ((location.search as any)?.posts as Sort) ?? "hot";
    await queryClient.ensureQueryData({
      queryKey: ["posts", sort],
      queryFn: () => fetchPosts(sort),
    });
  },
  component: Index,
  validateSearch: (search: { posts?: Sort }) => ({ posts: search.posts ?? "hot" }),
});

function Index() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const active = search.posts;

  const { data, isLoading, error } = useQuery<PostType[]>({
    queryKey: ["posts", active],
    queryFn: () => fetchPosts(active),
  });

  if (isLoading) return <Loader />;
  if (error || !data) {
    navigate({ to: "/error", search: { message: "Nothing were found" } });
    return null;
  }

  return (
    <div className="resp-grid p-2 gap-2">
      <aside className="lg:col-start-1 lg:row-start-1 lg:sticky lg:top-20 lg:self-start lg:justify-self-end h-fit">
        <PostFilterTabs to="/" />
      </aside>

      <aside className="card lg:col-start-3 lg:row-start-1 lg:sticky lg:top-20 h-fit order-2">
        <p className="text-sm font-semibold">Feed</p>
        <p className="text-xs text-tw-light-muted dark:text-tw-muted">Sorting affects what you see first (New / Hot / Best).</p>
      </aside>

      <main className="container pt-0 lg:col-start-2 lg:row-start-1">
        <section aria-label="Posts feed">
          {data.length > 0 ? (
            <ul className="container p-0">
              {data.map((post) => (
                <li className="card" key={post.id}>
                  <Post {...post} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card min-h-screen center">
              <img className="w-72 h-72 opacity-80" src="/sad.png" alt="No posts" />
              <p className="text-tw-light-muted dark:text-tw-muted text-center">No posts were found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Index;
