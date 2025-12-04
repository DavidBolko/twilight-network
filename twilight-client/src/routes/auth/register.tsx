import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type SyntheticEvent, useMemo, useState } from "react";
import api from "../../axios";
import axios from "axios";
import { validateRegistrationInput } from "../../validator";

export const Route = createFileRoute("/auth/register")({
  component: Register,
});

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quotes = ["Your next chapter begins at twilight.", "Where moments glow.", "Not a feed. A feeling.", "Quiet social for loud minds."];
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  const msg = (errorMessage ?? "").toLowerCase();
  const nameErr = msg.includes("name");
  const emailErr = msg.includes("email") || msg.includes("email format");
  const passErr = msg.includes("password");

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clientErr = validateRegistrationInput(name, email, password, password2);
    if (clientErr) {
      setErrorMessage(clientErr);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("password2", password2);

      const result = await api.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (result.status === 200) {
        await navigate({ to: "/auth/login" });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = String(err.response?.data ?? "").toLowerCase();

        if (status === 409 || message.includes("exists") || message.includes("already")) {
          setErrorMessage("An account with this email already exists.");
          return;
        }

        setErrorMessage("Registration failed. Please try again.");
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    }
  };

  return (
    <div className="container center lg:mt-16">
      <h1 className="text-4xl text-center lg:m-0">Create a new account</h1>

      <div className="card lg:flex-row center max-w-5xl p-6">
        <form onSubmit={submit} noValidate className="container lg:max-w-sm">
          <label htmlFor="name">Name</label>
          <input name="name" required onChange={(e) => setName(e.target.value)} className={nameErr ? "error" : ""} />

          <label htmlFor="email">Email</label>
          <input name="email" type="email" required onChange={(e) => setEmail(e.target.value)} className={emailErr ? "error" : ""} />

          <label htmlFor="password">Password</label>
          <input name="password" required type="password" onChange={(e) => setPassword(e.target.value)} className={passErr ? "error" : ""} />

          <label htmlFor="password2">Retype password</label>
          <input name="password2" required type="password" onChange={(e) => setPassword2(e.target.value)} className={passErr ? "error" : ""} />

          {errorMessage && <p className="text-red-500/80 text-sm mt-2">{errorMessage}</p>}

          <button type="submit" className="btn primary w-full mt-2">
            Continue
          </button>

          <div className="flex gap-2 items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Already have an account?</p>
            <a href="/auth/login" className="text-tw-primary hover:text-tw-accent">
              Please log in.
            </a>
          </div>
        </form>

        <div className="container lg:w-1/2 center">
          <img src="/twilight.png" alt="register illustration" className="max-w-[300px] w-full h-auto object-contain hover:animate-pulse" />
          <h2 className="text-lg text-glow">{quote}</h2>
        </div>
      </div>
    </div>
  );
}
