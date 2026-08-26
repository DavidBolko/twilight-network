export default function ChatEmpty() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-2">
      <img className="size-32 opacity-50" src="/anonymous.png" alt="" />
      <p className="text-tw-muted text-xs">Open a chat.</p>
    </div>
  );
}