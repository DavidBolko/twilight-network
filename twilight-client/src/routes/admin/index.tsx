import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex flex-col">
      <nav className="container fixed md:min-h-screen max-w-full bg-tw-surface/70 md:max-w-fit ">
        <ul className="flex md:flex-col gap-2 max-w-fit">
          <li>
            <Link className="btn" to="/admin">
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="btn" to="/admin/owls">
              Owls
            </Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
