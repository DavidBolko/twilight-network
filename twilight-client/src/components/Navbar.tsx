import {Link, useLocation} from "@tanstack/react-router";
import SearchComponent from "./SearchComponent.tsx";
import {useUser} from "../userContext.tsx";
import {LogOutIcon, SettingsIcon} from "lucide-react";

export default function Navbar() {
    const location = useLocation();
    const user = useUser();

    const isAuthPage = location.pathname.includes("auth");
    const isEmptyPage = location.pathname.includes("logout");
    const isLoggedIn = !!user;

    if(isEmptyPage) {
        return null;
    }

    if (isAuthPage) {
        return (
            <nav className="flex sticky top-0 items-center justify-center gap-2 w-full">
                <Link to="/" className="[&.active]:font-bold text-6xl font-bold">
                    TWILIGHT
                </Link>
            </nav>
        );
    }

    return (
        <nav className="p-2 grid sticky z-50 top-0 grid-cols-3 justify-between gap-2">
            <Link to="/" className="[&.active]:font-bold text-4xl">
                TWILIGHT
            </Link>
            <SearchComponent />
            <div className="place-self-end">
                {isLoggedIn ? <UserProfile user={user} /> : <a href="/auth/register" className="btn primary p-2">Sign Up</a>}
            </div>
        </nav>
    );
}

function UserProfile({ user }: { user: { name: string } }) {
    return (
        <div className="relative group ">
            <div className="flex flex-col gap-2 rounded-lg overflow-hidden rounded-b-none items-center bg-transparent hover:shadow-lg hover:dark:bg-tw-surface transition-all duration-200">

                <Link to="/" className="[&.active]:font-bold">
                    <div className="flex items-center gap-2 hover:bg-tw-primary/10 p-1.5">
                        <p>{user.name}</p>
                        <img src="/anonymous.png" className="w-10 h-10 rounded-full object-cover border border-tw-border/80" alt="profile_picture" />
                    </div>
                </Link>
                <div className="absolute top-full left-0 w-full overflow-hidden mt-0 group-hover:block hidden bg-tw-surface rounded-b-lg z-10 text-sm font-normal">
                    <hr className="border-t border-tw-border" />
                    <ul>
                        <li>
                            <Link to="/auth/logout" className="px-4 py-2 hover:bg-tw-primary/10 flex items-center gap-2"><SettingsIcon className="w-4 h-4"/>Settings</Link>
                        </li>
                        <li>
                            <Link to="/auth/logout" className="px-4 py-2 hover:bg-tw-primary/10 flex items-center gap-2"><LogOutIcon className="w-4 h-4"/>Logout</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}