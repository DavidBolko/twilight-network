import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { LightbulbIcon, MenuIcon, MoonIcon, SearchIcon, XIcon } from "lucide-react";

import SearchComponent from "./SearchComponent";
import { createPortal } from "react-dom";

type props = {
  setSidebarOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  isDark: boolean;
};

export default function Navbar(props: props) {
  const { pathname } = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);

  // skry navbar na auth/error/logout page (ak to chceš takto)
  const hide = pathname.includes("/auth") || pathname.startsWith("/error") || pathname.startsWith("/auth/logout");
  if (hide) return null;

  const isHome = pathname === "/";

  return (
    <nav className="navbar">
      <div className="flex flex-row items-center">
        <button className="hover:text-tw-primary xl:hidden" onClick={() => props.setSidebarOpen(!props.sidebarOpen)}>
          <MenuIcon />
        </button>
        <Link to="/" search={{ posts: "hot", time: "week" }} className={`${isHome ? "font-bold" : ""} text-2xl md:text-4xl `}>
          TWILIGHT
        </Link>
      </div>

      <div className="hidden lg:block col-start-2 w-full max-w-lg mx-4">
        <SearchComponent />
      </div>

      <div className="panel flex-row justify-end">
        <button type="button" onClick={() => setSearchOpen(true)} className="lg:hidden p-2 col-start-2 rounded hover:bg-tw-primary/10" aria-label="Open search">
          <SearchIcon className="w-6 h-6" />
        </button>

        {searchOpen ? <SearchModal onClose={() => setSearchOpen(false)} /> : null}
        <button type="button" className="hover:bg-tw-primary/10 p-2 rounded" onClick={props.toggleTheme}>
          {props.isDark ? <MoonIcon /> : <LightbulbIcon />}
        </button>
      </div>
    </nav>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-lg panel" onClick={onClose}>
      <div className="card flex-row justify-between max-w-lg w-full p-3" onClick={(e) => e.stopPropagation()}>
        <div className="w-full">
          <SearchComponent />
        </div>
        <button type="button" onClick={onClose} aria-label="Close search">
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
