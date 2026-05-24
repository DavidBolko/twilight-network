import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "../../api";
import { loginSchema } from "../../validation";
import type { z } from "zod";
import { Lock, Mail } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) ?? "/",
  }),
  component: Login,
});

const QUOTES = ["Your next chapter begins at twilight.", "Where moments glow.", "Not a feed. A feeling.", "Quiet social for loud minds."];

function Login() {
  const { redirect } = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const submit = handleSubmit(async (data) => {
    setServerError(null);
    try {
      const user = await api.post("auth/login", data);
      queryClient.setQueryData(["currentUser"], user);
      await navigate({ to: redirect });
    } catch (e) {
      if (e instanceof ApiError) {
        setServerError(e.message);
      } else {
        setServerError("Unexpected error occurred.");
      }
    }
  });
  return (
    <div className="panel center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-8 tracking-tighter">TWILIGHT</h1>

      <div className="card flex-col md:flex-row items-stretch max-w-[900px] w-full p-0 overflow-hidden shadow-2xl border-tw-light-border dark:border-tw-border">
        <form onSubmit={submit} className="panel p-8 md:p-12 flex-[1.2] gap-4">
          <div className="mb-2">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-sm opacity-60">Log in to your account to continue.</p>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-wrap">
              <Mail className="input-icon" />
              <input id="email" type="email" placeholder="you@example.com" className={`form-input ${errors.email ? "form-input-error" : ""}`} {...register("email")} />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-wrap">
              <Lock className="input-icon" />
              <input id="password" type="password" placeholder="••••••••" className={`form-input ${errors.password ? "form-input-error" : ""}`} {...register("password")} />
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {serverError && <p className="form-alert mt-2">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full mt-4 py-2.5 text-base">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-1 mt-4">
            <p className="text-sm opacity-60">Don't have an account?</p>
            <Link to="/auth/register" from="/auth/login" className="text-sm font-bold text-tw-primary hover:underline">
              Create an account
            </Link>
          </div>
        </form>

        <div className="hidden md:flex flex-1 center flex-col p-10 gap-6">
          <img src="/twilight.png" alt="Twilight" className="w-full max-w-[380px] h-auto object-contain drop-shadow-2xl" />
          <h2 className="text-lg text-glow italic opacity-70 text-center max-w-[200px] leading-tight">"{quote}"</h2>
        </div>
      </div>
    </div>
  );
}
