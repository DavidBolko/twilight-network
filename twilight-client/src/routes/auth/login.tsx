import { createFileRoute } from "@tanstack/react-router";
import { type SyntheticEvent, useMemo, useState } from "react";
import { queryClient } from "../../main.tsx";
import api from "../../axios.ts";

import { validateLoginInput } from "../../validator.ts";
import axios from "axios";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quotes = ["Your next chapter begins at twilight.", "Where moments glow.", "Not a feed. A feeling.", "Quiet social for loud minds."];
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clientErr = validateLoginInput(email, password);
    if (clientErr) {
      setErrorMessage(clientErr);
      return;
    }

    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("password", password);

    try {
      const result = await api.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (result.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        window.location.href = "/";
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = String(err.response?.data ?? "").toLowerCase();

        const invalid = status === 401 || message.includes("unauthorized") || message.includes("invalid");
        const notFound = status === 404 || message.includes("not found");

        if (notFound) {
          setErrorMessage("User not found.");
        } else if (invalid) {
          setErrorMessage("Invalid email or password.");
        } else {
          setErrorMessage("Login failed. Please try again.");
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    }
  };

  return (
    <div className="container center lg:mt-16">
      <h1 className="text-4xl text-center  lg:m-0">Welcome back</h1>

      <div className="card lg:flex-row center max-w-5xl p-6">
        <form onSubmit={submit} noValidate className="container lg:max-w-sm">
          <label htmlFor="email">Email</label>
          <input name="email" type="email" required onChange={(e) => setEmail(e.target.value)} className={`${errorMessage ? "error" : ""}`} />

          <label htmlFor="password">Password</label>
          <input name="password" type="password" required onChange={(e) => setPassword(e.target.value)} className={`${errorMessage ? "error" : ""}`} />

          {errorMessage && <p className="text-red-500/80 text-sm">{errorMessage}</p>}

          <button type="submit" className="btn primary w-full mt-2">
            Login
          </button>

          <div className="flex gap-2 items-center">
            <p className="text-sm text-tw-muted">Don't have an account?</p>
            <a href="/auth/register" className="text-tw-primary hover:text-tw-accent">
              Create an account
            </a>
          </div>
        </form>

        <div className="container lg:w-1/2 center">
          <img src="/twilight.png" alt="login illustration" className="max-w-[300px] w-full h-auto object-contain" />
          <h2 className="text-lg text-glow">{quote}</h2>
        </div>
      </div>
    </div>
  );
}
