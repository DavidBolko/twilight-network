import { AtSymbolIcon, KeyIcon } from "@heroicons/react/24/solid";
import { FC, useState } from "react";
import { LoginCard } from "./LoginCard";
import { RegisterCard } from "./RegisterCard";

export const AuthCard:FC = () =>{
  const [register, setRegister] = useState(false);
  if(!register){
    return(
      <LoginCard toggleCard={setRegister}/>
    )
  }
  else{
    return(
      <RegisterCard toggleCard={setRegister}/>
    )
  }
}