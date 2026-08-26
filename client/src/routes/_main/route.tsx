import { createFileRoute, Outlet } from "@tanstack/react-router";
import Dock from "../../components/Dock";
import Chat from "../../components/Chat/Chat";
import Sidebar from "../../components/Sidebar";

export const Route = createFileRoute('/_main')({
  component: Root,
});

function Root() {
  return (
    <div className="flex xl:pl-32 md:flex-row justify-center">
      <Sidebar />
      <Dock />

      <main className="w-full pt-12 xl:pt-0 max-w-[700px] min-h-screen">
        <Outlet />
      </main>

      <Chat />

      <aside className="w-0 xl:w-[300px]">
      </aside>
    </div>
  );
}
