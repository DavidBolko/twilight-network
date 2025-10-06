import { Link, useLocation } from "@tanstack/react-router";
import SearchComponent from "./SearchComponent.tsx";
import { useUser } from "../userContext.tsx";
import { LogOutIcon, PlusIcon, SettingsIcon, SearchIcon, XIcon } from "lucide-react";
import CreateCommunityModal from "./CreateCommunityModal.tsx";
import { useState } from "react";
import { getFromCdn } from "../utils.ts";

export default function Navbar() {
  const location = useLocation();
  const user = useUser();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const indexActive = location.pathname.indexOf("/") == location.pathname.lastIndexOf("/");

  const isAuthPage = location.pathname.includes("auth");
  const isEmptyPage = location.pathname.includes("logout");
  const isLoggedIn = !!user;

  if (isEmptyPage) {
    return null;
  }

  if (isAuthPage) {
    return (
      <nav className="flex fixed z-50 top-0 items-center justify-center gap-2 w-full">
        <Link search={{ posts: "hot" }} to="/" className="[&.active]:font-bold text-4xl md:text-6xl font-bold">
          TWILIGHT
        </Link>
      </nav>
    );
  }

  return (
    <nav className="p-2 flex sticky z-50 top-0 justify-between items-center gap-2 bg-tw-light-surface dark:bg-tw-surface shadow-md">
      <Link search={{ posts: "hot" }} to="/" className={`${indexActive ? "font-bold" : ""} text-2xl md:text-4xl`}>
        TWILIGHT
      </Link>

      <div className="hidden md:block w-full max-w-lg mx-4">
        <SearchComponent />
      </div>

      <div className="flex">
        <div className="md:hidden">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded hover:bg-tw-primary/10">
            <SearchIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="md:flex place-self-end">
          {isLoggedIn ? (
            <UserProfile user={user} />
          ) : (
            <Link to="/auth/register" className="btn primary p-2">
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-start justify-center p-4">
          <div className="bg-tw-light-surface dark:bg-tw-surface w-full max-w-lg rounded-lg p-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Search</h2>
              <button onClick={() => setIsSearchOpen(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <SearchComponent />
          </div>
        </div>
      )}
    </nav>
  );
}

function UserProfile({ user }: { user: { name: string; id: string; image?: string } }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative group">
      <div className="flex flex-col gap-2 rounded-lg w-48 overflow-hidden hover:bg-tw-primary/10 rounded-b-none items-end bg-transparent hover:shadow-lg transition-all duration-200">
        <Link to="/user/$id" params={{ id: user.id }} reloadDocument={true} activeOptions={{ includeSearch: false }} className="hover:font-bold">
          <div className="flex justify-items-end items-center gap-2 w-full p-1.5">
            <p>{user.name}</p>
            <img src={user.image ? getFromCdn(user.image) : "/anonymous.png"} className="w-10 h-10 rounded-full object-cover border border-tw-border/80" alt="profile_picture" />{" "}
          </div>
        </Link>
        <div className="absolute top-full left-0 w-48 overflow-hidden mt-0 group-hover:block hidden shadow-md dark:bg-tw-surface bg-tw-light-surface rounded-b-lg z-10 text-sm font-normal">
          <hr className="border-t border-tw-border" />
          <ul>
            <li>
              <Link to="/auth/logout" className="px-4 py-2 hover:bg-tw-primary/10 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </Link>
            </li>
            <li>
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 hover:bg-tw-primary/10 flex items-center gap-2 w-full">
                <PlusIcon className="w-4 h-4" />
                New Community
              </button>
              <CreateCommunityModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </li>
            <li>
              <Link to="/auth/logout" className="px-4 py-2 hover:bg-tw-primary/10 flex items-center gap-2">
                <LogOutIcon className="w-4 h-4" />
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
