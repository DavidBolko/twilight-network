import { Clock, Flame, Sparkles } from "lucide-react";
import type { z } from "zod";
import { searchSchema } from "../schemas";

type Search = z.infer<typeof searchSchema>;

const icons = {
  new: <Clock size={18} />,
  hot: <Flame size={18} />,
  top: <Sparkles size={18} />,
};

type Props = {
  activeSort: Search["posts"];
  activeTime: Search["time"];
  onChange: (sort: Search["posts"], time: Search["time"]) => void;
};

export function PostFilterTabs({ activeSort, activeTime, onChange }: Props) {
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-tw-light-border dark:border-tw-border bg-tw-light-surface/50 dark:bg-tw-surface/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex gap-4">
        {(["hot", "new", "top"] as Search["posts"][]).map((sort) => (
          <button
            key={sort}
            onClick={() => onChange(sort, activeTime)}
            className={`flex items-center gap-1.5 transition-colors ${
              activeSort === sort
                ? "text-tw-primary-dark dark:text-tw-primary font-bold"
                : "text-tw-muted hover:text-tw-light-text dark:hover:text-tw-text"
            }`}
          >
            {icons[sort]}
            <span className="text-sm capitalize hidden sm:inline">{sort}</span>
          </button>
        ))}
      </div>

      {activeSort === "top" && (
        <select
          value={activeTime}
          onChange={(e) => onChange(activeSort, e.target.value as Search["time"])}
          className="bg-transparent text-xs font-medium border-none focus:ring-0 cursor-pointer text-tw-muted hover:text-tw-text"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      )}
    </div>
  );
}