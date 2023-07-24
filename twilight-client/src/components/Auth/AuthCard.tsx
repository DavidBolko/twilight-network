import { FC, useState } from "react";
import { LoginCard } from "./LoginCard";
import { RegisterCard } from "./RegisterCard";
import ProfileInformation from "./ProfileInformation";

type props = {
  refetch: Function
}

export const AuthCard:FC<props> = (props) =>{
  const [register, setRegister] = useState(false);
  if(!register){
    return(
      <>
        <LoginCard toggleCard={setRegister} refetch={props.refetch}/>
      </>
    )
  }
  else{
    return(
      <RegisterCard toggleCard={setRegister}/>
    )
  }
}