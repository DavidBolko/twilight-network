import {createRootRoute, Outlet} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Navbar from "../components/Navbar.tsx";
import { UserProvider } from '../userContext.tsx';

export const Route = createRootRoute({
    component: Root
})

function Root(){
    return (
        <>
            <UserProvider>
                <Navbar/>
                <Outlet/>
                <TanStackRouterDevtools/>
            </UserProvider>
        </>
    )
}