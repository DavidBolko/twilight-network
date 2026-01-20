import { useNavigate, useSearch } from "@tanstack/react-router";
import { Clock, Flame, Sparkles } from "lucide-react";

type Sort = "new" | "hot" | "best";
type TimeRange = "day" | "week" | "month" | "year" | "all";

type Props = {
  to: string;
  params?: Record<string, string>;
};

const TABS: Sort[] = ["new", "hot", "best"];

export function PostFilterTabs({ to, params }: Props) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { posts?: Sort; time?: TimeRange };

  const activeSort: Sort = search.posts ?? "hot";
  const activeTime: TimeRange = search.time ?? "week";

  const setSearch = (patch: Partial<{ posts: Sort; time: TimeRange }>) => {
    navigate({
      to,
      params,
      search: (prev) => {
        const next = { ...(prev as Record<string, unknown>), ...patch } as {
          posts?: Sort;
          time?: TimeRange;
        };

        if ((next.posts ?? "hot") === "hot" && (!next.time || next.time === "all")) next.time = "week";
        return next;
      },
    });
  };

  return (
    <nav aria-label="Post filters" className="card flex-row items-center gap-2 h-[4rem]">
      {TABS.map((tab) => {
        const active = activeSort === tab;

        return (
          <button key={tab} type="button" aria-pressed={active} onClick={() => setSearch({ posts: tab })} className={["btn w-full border-none p-2 gap-2 lg:w-24", active ? "bg-tw-primary-dark text-white" : "bg-transparent hover:bg-tw-primary/20"].join(" ")}>
            {tab === "new" ? <Clock size={16} aria-hidden /> : null}
            {tab === "hot" ? <Flame size={16} aria-hidden /> : null}
            {tab === "best" ? <Sparkles size={16} aria-hidden /> : null}
            <span className="capitalize">{tab}</span>
          </button>
        );
      })}

      {activeSort !== "hot" ? (
        <label className="panel flex-row items-center gap-2 ml-auto text-sm opacity-80 w-fit">
          <span className="hidden lg:block text-xs">Time</span>
          <select className="text-xs" value={activeTime} onChange={(e) => setSearch({ time: e.target.value as TimeRange })} aria-label="Time range">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="all">All</option>
          </select>
        </label>
      ) : null}
    </nav>
  );
}
