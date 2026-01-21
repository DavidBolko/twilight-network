import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../axios";
import { getFromCdn } from "../utils";
import type { Community } from "../types";
import { Loader } from "lucide-react";

type Category = { id: number; name: string };

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

async function fetchCategories(): Promise<Category[]> {
  const res = await api.get(`/categories`);
  return res.data;
}

async function fetchCommunities(categoryId: number | null): Promise<Community[]> {
  const res = await api.get(`/c`, {
    params: categoryId ? { categoryId } : undefined,
  });
  return res.data;
}

function ExplorePage() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const catQ = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const comQ = useQuery({
    queryKey: ["communities", activeCategoryId],
    queryFn: () => fetchCommunities(activeCategoryId),
  });

  const categories = catQ.data ?? [];
  const communities = comQ.data ?? [];

  const tabs = useMemo(() => [{ id: null as number | null, name: "All" }, ...categories], [categories]);

  return (
    <div className="p-8 xl:pl-72 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Explore</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((c) => {
          const active = c.id === activeCategoryId;
          return (
            <button key={String(c.id)} onClick={() => setActiveCategoryId(c.id)} className={`btn ${active ? "primary" : "muted"} whitespace-nowrap`} type="button">
              {c.name}
            </button>
          );
        })}
      </div>

      {catQ.isError ? <p className="text-sm text-red-500">Failed to load categories.</p> : null}
      {comQ.isError ? <p className="text-sm text-red-500">Failed to load communities.</p> : null}
      {comQ.isLoading ? (
        <div className="pt-64">
          <Loader />
        </div>
      ) : null}

      {!comQ.isLoading && (
        <div className="flex flex-col gap-2">
          {communities.length ? (
            communities.map((c) => {
              const img = c.imageUrl ?? null;
              return (
                <Link key={c.id} to="/communities/$id" params={{ id: String(c.id) }} search={{ posts: "hot" }} className="panel flex-row items-center gap-3 hover:bg-tw-primary/10">
                  <img src={img ? getFromCdn(img) : "/avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    {c.description ? <p className="text-xs opacity-70 line-clamp-1">{c.description}</p> : null}
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-sm opacity-70">No communities found.</p>
          )}
        </div>
      )}
    </div>
  );
}
