import { Link } from "@tanstack/react-router";
import { BellIcon, BookmarkIcon, CompassIcon, HomeIcon, MessageCircleIcon, SearchIcon, SettingsIcon } from "lucide-react";
import { useChatStore } from "../appStores";
import { useUser } from "../hooks";


const activeCls = "text-glow text-tw-primary";
const baseCls = "flex flex-col items-center gap-0.5 text-xs hover:text-tw-primary";

export default function Dock() {
  const toggleChat = useChatStore((s) => s.toggleChat);
  const user = useUser();

  return (
    <div className="flex absolute xl:hidden bottom-0 w-full">
      <div className="flex fixed top-0 px-2 h-12 justify-between w-full items-center dark:bg-tw-bg/50 bg-tw-light-bg/30 backdrop-blur-sm z-50">
        <img className="size-8 rounded-full border border-tw-muted/50" src="/anonymous.png" />
        <Link to="/" search={{ posts: "hot", time: "all" }} className="text-2xl md:text-4xl font-bold" activeProps={{ className: "text-glow" }} activeOptions={{ exact: true }}>
          TWILIGHT
        </Link>
        <div className="flex flex-row gap-2">
          <button className="btn-primary-icon" onClick={toggleChat}>
            <MessageCircleIcon />
          </button>
          <Link to="/explore" search={{ tab: "Posts" }}>
            <SearchIcon />
          </Link>
        </div>
      </div>
      <nav className="dock-nav dark:bg-tw-bg/80 bg-tw-light-bg/80 backdrop-blur-lg z-50 flex items-center justify-around">
        <Link to="/" search={{ posts: "hot", time: "all" }} className={baseCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>
          <HomeIcon size={20} />
          Home
        </Link>
        <Link to="/explore" search={{ tab: "Posts" }} className={baseCls} activeProps={{ className: activeCls }}>
          <CompassIcon size={20} />
          Explore
        </Link>
        <Link to="/user/$id" params={{ id: user!.id }} search={{ tab: "Saved" }} className={baseCls} activeProps={{ className: activeCls }}>
          <BookmarkIcon size={20} />
          Saved
        </Link>
        <Link to="/notifications" className={baseCls} activeProps={{ className: activeCls }}>
          <BellIcon size={18} />
          Notifications
        </Link>
        <Link to="/settings" className={baseCls} activeProps={{ className: activeCls }}>
          <SettingsIcon size={20} />
          Settings
        </Link>
      </nav>
    </div>
  );
}
