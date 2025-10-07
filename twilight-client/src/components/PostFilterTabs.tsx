import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

type PostFilterTabsProps = {
  to: string;
  params?: Record<string, string>;
};

export function PostFilterTabs({ to, params }: PostFilterTabsProps) {
  const navigate = useNavigate();
  const [active, setActive] = useState<"new" | "hot" | "best">("hot");

  const tabs: ("new" | "hot" | "best")[] = ["new", "hot", "best"];

  const handleClick = (tab: "new" | "hot" | "best") => {
    setActive(tab);
    navigate({ to, params, search: { posts: tab } });
  };

  return (
    <div className="flex flex-row lg:flex-col lg:justify-start place-items-end row-start-1">
      {tabs.map((tab) => (
        <button key={tab} onClick={() => handleClick(tab)} className={`btn border-none text-left p-2 w-24 transition-colors ${active === tab ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}
