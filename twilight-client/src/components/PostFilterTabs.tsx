import { useNavigate, useSearch } from "@tanstack/react-router";
import { Clock, Flame, Sparkles } from "lucide-react";

type Sort = "new" | "hot" | "best";

type PostFilterTabsProps = {
  to: string;
  params?: Record<string, string>;
};

export function PostFilterTabs({ to, params }: PostFilterTabsProps) {
  const navigate = useNavigate();

  const search = useSearch({ strict: false }) as { posts?: Sort };
  const active: Sort = search.posts ?? "hot";

  const tabs: Sort[] = ["new", "hot", "best"];

  const handleClick = (tab: Sort) => {
    navigate({ to, params, search: { posts: tab } });
  };

  const iconByTab: Record<"new" | "hot" | "best", React.ReactNode> = {
    new: <Clock size={16} aria-hidden="true" />,
    hot: <Flame size={16} aria-hidden="true" />,
    best: <Sparkles size={16} aria-hidden="true" />,
  };

  return (
    <nav aria-label="Post filters" className="container pt-0 flex-row justify-end lg:flex-col lg:items-end">
      {tabs.map((tab) => (
        <button key={tab} type="button" aria-pressed={active === tab} onClick={() => handleClick(tab)} className={`btn w-full border-none p-2 lg:w-24 gap-2 ${active === tab ? "bg-tw-primary-dark text-white border-transparent" : "bg-transparent hover:bg-tw-primary/20"}`}>
          {iconByTab[tab]}
          <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
        </button>
      ))}
    </nav>
  );
}
