type PostFilter = "new" | "hot" | "best";
interface PostSelectorProps {
  active: PostFilter;
  onChange: (filter: PostFilter) => void;
}

export default function PostSelector({ active, onChange }: PostSelectorProps) {
  return (
    <div className="flex justify-evenly lg:flex-col lg:justify-start place-items-end row-start-1 text-right gap-2">
      <button onClick={() => onChange("new")} className={`btn border-none text-left p-2 w-24 ${active === "new" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
        New
      </button>
      <button onClick={() => onChange("hot")} className={`btn border-none text-left p-2 w-24 ${active === "hot" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
        Hot
      </button>
      <button onClick={() => onChange("best")} className={`btn border-none text-left p-2 w-24 ${active === "best" ? "bg-tw-primary/70" : "hover:bg-tw-primary/50"}`}>
        Best
      </button>
    </div>
  );
}
