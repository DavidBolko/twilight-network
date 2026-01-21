import { createFileRoute } from "@tanstack/react-router";
import Loader from "../../components/Loader.tsx";
import { useEffect } from "react";

import api from "../../axios.ts";

export const Route = createFileRoute("/auth/logout")({
  component: Logout,
});

function Logout() {
  useEffect(() => {
    const logout = async () => {
      await api.post("/auth/logout", {});

      window.location.href = "/";
    };

    logout();
  }, []);

  return (
    <div className="pt-64">
      <Loader />
    </div>
  );
}