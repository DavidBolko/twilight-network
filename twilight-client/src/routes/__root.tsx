import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import SearchComponent from "../components/SearchComponent.tsx";

export const Route = createRootRoute({
    component: () => (
        <>
            <nav className="p-2 grid grid-cols-3 justify-between gap-2">
                <Link to="/" className="[&.active]:font-bold text-4xl">
                    TWILIGHT
                </Link>{' '}
                <SearchComponent/>
                <Link to="/communities/create" className="[&.active]:font-bold place-self-end">
                    <img src="pic.jpg" className="w-10 h-10 rounded-full object-cover"  alt="profile_picture"/>
                </Link>
            </nav>
            <Outlet />
            <TanStackRouterDevtools />
        </>
    ),
})