import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/communities/$id/settings/")({
  component: GeneralSettings,
});

function GeneralSettings() {
  return (
    <h1>Global Settings</h1>
  );
}
