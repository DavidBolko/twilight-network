import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/solid";
import { FC, useState } from "react";

interface Props {
  toggleCard: Function;
}

export const LoginCard: FC<Props> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const data = {
      username: email,
      password: password,
    };
    await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit}  className="flex flex-col gap-6 p-8 text-lg border-2 bg-slate-800/60 backdrop-blur-sm rounded-md text-center shadow-2xl shadow-indigo-800">
      <p>Sign in to your account</p>
      <div className="flex border-b-2">
        <label htmlFor="email" className="hidden">
          E-Mail
        </label>
        <AtSymbolIcon width={20} />
        <input type="text" name="email" placeholder="JohnDoe@gmail.com"  onChange={(e)=>setEmail(e.target.value)}/>
      </div>
      <div className="flex border-b-2">
        <label htmlFor="password" className="hidden">
          Password
        </label>
        <KeyIcon width={20} />
        <input type="password" name="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
      </div>
      <input type="submit" />
      <div className="text-sm">
        <p>Don't have an account?</p>
        <a
          className="font-bold hover:text-indigo-700 hover:cursor-pointer"
          onClick={(e) => props.toggleCard(true)}
        >
          Sign Up
        </a>
      </div>
    </form>
  );
};
