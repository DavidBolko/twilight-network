import { createFileRoute } from "@tanstack/react-router";
import { type SyntheticEvent, useMemo, useState } from "react";
import axios from "axios";
import { queryClient } from "../../main.tsx";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const quotes = ["Your next chapter begins at twilight.", "Where moments glow.", "Not a feed. A feeling.", "Quiet social for loud minds."];
  const quote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (result.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        window.location.href = "/";
      }
      console.log("Success:", result.data);
    } catch (err) {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <h1 className="text-4xl mb-6 text-center">Welcome back</h1>
      <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-16 items-center justify-center w-full max-w-5xl card rounded-xl p-6">
        <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-md lg:max-w-sm">
          <label htmlFor="email">Email</label>
          <input name="email" required type="email" onChange={(e) => setEmail(e.target.value)} className={`${error ? "error" : ""}`} />

          <label htmlFor="password">Password</label>
          <input name="password" required type="password" onChange={(e) => setPassword(e.target.value)} className={`${error ? "error" : ""}`} />
          {error ? <p className="text-red-500/80 text-sm">Invalid email or password</p> : ""}
          <button type="submit" className="btn primary w-full mt-2">
            Login
          </button>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Don't have an accout?</p>
            <a href="/auth/register" type="submit" className="text-tw-primary hover:text-tw-accent">
              Create an account
            </a>
          </div>
        </form>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
          <img src="/twilight.png" alt="login illustration" className="max-w-[300px] w-full h-auto object-contain" />
          <h2 className="text-lg text-glow">{quote}</h2>
        </div>
      </div>
    </div>
  );
}
