import { createFileRoute, useSearch } from "@tanstack/react-router";
import ErrorComponent from "../components/ErrorComponent";

export const Route = createFileRoute("/error")({
  component: ErrorPage,
});

function ErrorPage() {
  const { message } = useSearch({ from: Route.id }) as { message?: string };

  const error = message ? new Error(message) : undefined;

  return <ErrorComponent error={error} />;
}
