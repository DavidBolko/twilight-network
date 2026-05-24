import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/communities/$id/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const { id } = useParams({ from: "/communities/$id/settings" });

  return (
    <div className="panel md:flex-row w-full h-full bg-tw-surface p-0">
      <aside className="panel pt-16 md:w-64 ">
        <h2 className="text-xl font-bold p-2 italic uppercase">Community Settings</h2>
        <Link to="/communities/$id/settings/global" params={{ id }} className="p-3 rounded-xl transition-all [&.active]:bg-tw-primary/10 [&.active]:text-tw-primary font-bold border border-transparent [&.active]:border-tw-primary/20">
          General Settings
        </Link>
        <Link to="/communities/$id/settings/members" params={{ id }} className="p-3 rounded-xl transition-all [&.active]:bg-tw-primary/10 [&.active]:text-tw-primary font-bold border border-transparent [&.active]:border-tw-primary/20">
          Member Management
        </Link>
      </aside>

      <main className="panel bg-tw-bg w-full">
        <Outlet />
      </main>
    </div>
  );
}
