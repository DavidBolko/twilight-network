import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { queryClient } from "../../main";
import type { FullUser } from "../../types";
import { useQuery } from "@tanstack/react-query";
import Post from "../../components/Post";
import CommunityCard from "../../components/CommunityCard";
import { useUser } from "../../userContext";
import { UserProfile } from "../../components/UserProfile";

import api from "../../axios";

const categories = ["Posts", "Communities", "Saved"] as const;

const fetchUser = async (id: string) => {
  const res = await api.get<FullUser>(`/users/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const Route = createFileRoute("/user/$id")({
  loader: async ({ params }) => {
    await queryClient.ensureQueryData({
      queryKey: ["user", params.id],
      queryFn: () => fetchUser(params.id),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const [category, setCategory] = useState<"Posts" | "Communities" | "Saved">("Posts");

  const { id } = Route.useParams();
  const { data, refetch } = useQuery<FullUser>({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  if (!data) return null;

  return (
    <div className="center-col">
      <div className="lg:col-start-2 mt-4">
        <UserProfile data={data} id={id} refetch={refetch} currentUser={user ?? null} />

        <section className="panel">
          <div className="flex w-full">
            {categories.map((cat, i) => (
              <button key={cat}
                onClick={() => {
                  setCategory(cat);
                  refetch();
                }}
                className={`btn w-full ${i === 0 ? "rounded-r-none" : i === categories.length - 1 ? "rounded-l-none" : "rounded-none"} ${category === cat ? "primary" : "hover:bg-tw-primary/20"}`}>
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          {category === "Posts" &&
            (data.posts.length > 0 ? (
              <ul className="panel p-0">
                {data.posts.map((post) => (
                  <li className="card" key={post.id}>
                    <Post {...post} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No posts yet.</p>
            ))}

          {category === "Communities" &&
            (data.communities.length > 0 ? (
              <ul className="panel p-0">
                {data.communities.map((com) => (
                  <li key={com.id}>
                    <CommunityCard community={com} currentUserId={user?.id} isOwnProfile={user?.id === data.id} refetch={refetch} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No communities yet.</p>
            ))}

          {category === "Saved" &&
            (data.saved.length > 0 ? (
              <ul className="panel p-0">
                {data.saved.map((post) => (
                  <li className="card" key={post.id}>
                    <Post {...post} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No saved posts yet.</p>
            ))}
        </section>
      </div>
    </div>
  );
}

export default RouteComponent;
