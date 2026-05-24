import { Link, useLocation } from "@tanstack/react-router";
import { BookmarkIcon, CompassIcon, HomeIcon, SearchIcon, SettingsIcon } from "lucide-react";

export default function Dock() {
  const isHome = useLocation({
    select: (location) => location.pathname === "/",
  });
  const isExplore = useLocation({
    select: (location) => location.pathname.includes("explore"),
  });
  return (
    <div className="dock">
      <div className="flex fixed top-0 px-2 h-12 justify-between w-full items-center dark:bg-tw-bg/50 bg-tw-light-bg/30 backdrop-blur-sm z-50">
        <img className="size-8 rounded-full border border-tw-muted/50" src="/anonymous.png" />
        <Link to="/" search={{ posts: "hot", time: "all" }} className={` text-2xl md:text-4xl font-bold ${isHome ? "text-glow" : ""}`}>
          TWILIGHT
        </Link>
        <Link to="/" search={{ posts: "hot", time: "all" }} className={` text-2xl md:text-4xl font-bold ${isHome ? "text-glow" : ""}`}>
          <SearchIcon />
        </Link>
      </div>
      <nav className="dock-nav dark:bg-tw-bg/80 bg-tw-light-bg/80 backdrop-blur-lg z-50 flex items-center justify-around">
        <Link to="/" search={{ posts: "hot", time: "all" }} className={`flex flex-col items-center gap-0.5 text-xs text-glow hover:text-tw-primary ${isHome ? "text-glow" : ""}`}>
          <HomeIcon size={20} />
          Home
        </Link>
        <Link to="/explore" search={{ posts: "hot", time: "all" }} className={`flex flex-col items-center gap-0.5 text-xs text-glow hover:text-tw-primary ${isExplore ? "text-glow" : ""}`}>
          <CompassIcon size={20} />
          Explore
        </Link>
        <Link to="/explore" search={{ posts: "hot", time: "all" }} className="flex flex-col items-center gap-0.5 text-xs hover:text-tw-primary">
          <BookmarkIcon size={20} />
          Saved
        </Link>
        <Link to="/explore" search={{ posts: "hot", time: "all" }} className="flex flex-col items-center gap-0.5 text-xs hover:text-tw-primary">
          <SettingsIcon size={20} />
          Settings
        </Link>
      </nav>
    </div>
  );
}
