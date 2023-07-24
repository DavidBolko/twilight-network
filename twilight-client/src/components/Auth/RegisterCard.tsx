import { AtSymbolIcon, KeyIcon, UserIcon } from "@heroicons/react/24/solid";
import { FC, useState } from "react";
import ProfileInformation from "./ProfileInformation";
import AdditionalInformationCard from "./AdditionalInformationCard";
import SubmitButton from "../elements/SubmitButton";

interface Props {
  toggleCard: Function;
}

export const RegisterCard: FC<Props> = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [phase, setPhase] = useState(1);
  const [buttonState, setButtonState] = useState("neutral");

  const fr = new FileReader();

  const handleNext = async(e: React.SyntheticEvent) =>{
    e.preventDefault();
    const data = {
      Email: email,
      password: password,
      password2: password2,
    }
    const res = await fetch("/api/auth/signupstepone", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    })
    if(res.ok){
      timeout
      setPhase(2)
    }
  }
  if(phase==2){
    return(
      <ProfileInformation email={email} password={password} password2={password2} return={props.toggleCard}/>
    )
  }
  return (
    <form onSubmit={handleNext} className="flex flex-col justify-center min-w-[300px] gap-2 p-8 text-lg bg-nord-snow-200 dark:bg-nord-night-300 backdrop-blur-sm rounded-l-md text-center">
      <p>Create an account</p>
      <div className="flex form-input">
        <label htmlFor="email" className="hidden">
          E-Mail
        </label>
        <AtSymbolIcon width={20} className=""/>
        <input type="text" name="email" placeholder="JohnDoe@gmail.com" onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex form-input">
        <label htmlFor="password" className="hidden">
          Password
        </label>
        <KeyIcon width={20} />
        <input type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="flex form-input">
        <label htmlFor="password" className="hidden">
          Password
        </label>
        <KeyIcon width={20} />
        <input type="password" name="password2" placeholder="Repeat password" onChange={(e) => setPassword2(e.target.value)} />
      </div>
      <SubmitButton state={buttonState} text="Next"/>
      <div className="text-sm">
        <p>Already have an account?</p>
        <a className="font-bold hover:text-nord-frost-100 hover:cursor-pointer" onClick={(e) => props.toggleCard(false)}>
          Sign In
        </a>
      </div>
    </form>
  );
};
