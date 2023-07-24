import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/solid";
import { FC, useState } from "react";

interface Props {
  toggleCard: Function;
  refetch: Function,
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
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if(res.ok){
      props.refetch()
    }
  };

  return (
    <form onSubmit={handleSubmit}  className="flex flex-col gap-2 p-8 text-lg min-w-[300px] justify-center bg-nord-snow-200 dark:bg-nord-night-300 rounded-l-md text-center">
      <p className="text-xl">Sign in to your account</p>
      <div className="flex form-input">
        <label htmlFor="email" className="hidden">
          E-Mail
        </label>
        <AtSymbolIcon width={20} />
        <input type="text" name="email" className="" placeholder="JohnDoe@gmail.com"  onChange={(e)=>setEmail(e.target.value)}/>
      </div>
      <div className="flex form-input">
        <label htmlFor="password" className="hidden">
          Password
        </label>
        <KeyIcon width={20} />
        <input type="password" name="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
      </div>
      <input type="submit" className="button-colored w-full"/>
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
