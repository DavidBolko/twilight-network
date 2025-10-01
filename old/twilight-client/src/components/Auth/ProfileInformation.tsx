import { FC, useEffect, useState } from "react";
import { CDN } from "../../utils";

interface props {
  email: string;
  password: string;
  password2: string;
  return: Function
}

const ProfileInformation: FC<props> = (props) => {
  const fr = new FileReader();
  const [displayName, setDisplayName] = useState("");

  let years: number[] = [];
  for (let i = 2023; i > 1924; i--) {
    years.push(i);
  }

  const handleSubmit = async(e: React.SyntheticEvent) =>{
    e.preventDefault()
    const data = {
      Email: props.email,
      password: props.password,
      password2: props.password2,
      displayName: displayName,

    }
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    if(res.ok){
      props.return(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-6 p-6 text-lg min-w-[300px] bg-nord-snow-200 dark:bg-nord-night-300 rounded-md">
      <p className="text-lg font-semibold">Personal Information</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-base">Display name</label>
        <input type="text" name="name" className="form-input-w-svg" onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" />
        <div className="flex flex-col">
          <p className="text-base">Date of birth</p>
          <div className="flex gap-2">
            <input type="number" className="form-input-w-svg w-16" placeholder={new Date().getDay().toString()} />
            <input type="number" className="form-input-w-svg w-16" placeholder={new Date().getMonth().toString()} />
            <select className="form-input-w-svg w-full">
              {years.map((ele) => (
                <option value={ele}>{ele.toString()}</option>
              ))}
            </select>
          </div>
        </div>
        <label htmlFor="about" className="hidden">
          Password
        </label>
        <button type="submit" className="button-colored w-full">
          Create account
        </button>
      </div>
    </form>
  );
};

export default ProfileInformation;
