import React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Clock, Flame, Sparkles } from "lucide-react";

type Sort = "new" | "hot" | "best";
type TimeRange = "day" | "week" | "month" | "year" | "all";

type PostFilterTabsProps = {
  to: string;
  params?: Record<string, string>;
};

export function PostFilterTabs({ to, params }: PostFilterTabsProps) {
  const navigate = useNavigate();

  const search = useSearch({ strict: false }) as { posts?: Sort; time?: TimeRange };
  const activeSort: Sort = search.posts ?? "hot";
  const activeTime: TimeRange = search.time ?? "week";

  const tabs: Sort[] = ["new", "hot", "best"];

  const iconByTab: Record<Sort, React.ReactNode> = {
    new: <Clock size={16} aria-hidden="true" />,
    hot: <Flame size={16} aria-hidden="true" />,
    best: <Sparkles size={16} aria-hidden="true" />,
  };

  const setSort = (tab: Sort) => {
    navigate({
      to,
      params,
      search: (prev: any) => {
        const next: any = { ...prev, posts: tab };

        if (tab === "hot" && (!next.time || next.time === "all")) {
          next.time = "week";
        }

        return next;
      },
    });
  };

  const setTime = (time: TimeRange) => {
    navigate({
      to,
      params,
      search: (prev: any) => {
        const next: any = { ...prev, time };

        // voliteľné: ak je hot a user dá all, zhoď to na week (aby nebolo hot==best)
        if ((next.posts ?? "hot") === "hot" && next.time === "all") {
          next.time = "week";
        }

        return next;
      },
    });
  };

  return (
    <nav aria-label="Post filters" className="container pt-0 flex-row justify-end lg:flex-col lg:items-end gap-2">
      {tabs.map((tab) => (
        <button key={tab} type="button" aria-pressed={activeSort === tab} onClick={() => setSort(tab)} className={`btn w-full border-none p-2 lg:w-24 gap-2 ${activeSort === tab ? "bg-tw-primary-dark text-white border-transparent" : "bg-transparent hover:bg-tw-primary/20"}`}>
          {iconByTab[tab]}
          <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
        </button>
      ))}

      {/* TIME */}
      {activeSort != "hot" ? (
        <label className="container center text-sm opacity-80 w-full lg:w-24">
          <span className="hidden lg:block text-xs">Time</span>
          <select className="w-full text-xs" value={activeTime} onChange={(e) => setTime(e.target.value as TimeRange)} aria-label="Time range">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All</option>
          </select>
        </label>
      ) : (
        ""
      )}
    </nav>
  );
}
