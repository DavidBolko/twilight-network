import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Loader from "../../components/Loader.tsx";
import { useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/auth/logout")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const logout = async () => {
      await axios.get(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        withCredentials: true,
      });
      window.location.href = "/";
    };
    logout();
  }, [navigate]);

  return <Loader />;
}
