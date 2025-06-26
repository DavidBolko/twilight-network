import { Check, CircleNotch } from "@phosphor-icons/react";
import { FC, useState } from "react";

interface props {
  text: string;
  state: string,
}

const SubmitButton: FC<props> = (props) => {
  if (props.state == "loading") {
    <button type="submit" className="grid grid-cols-3 button-colored bg-aurora-200 w-full items-center"><p className="col-start-2">{props.text}</p><CircleNotch className="animate-spin ml-auto"/></button>
  } 
  else if (props.state == "granted") {
    <button type="submit" className="grid grid-cols-3 button-colored-green bg-aurora-200 w-full items-center"><p className="col-start-2">{props.text}</p><Check className="ml-auto"/></button>
  }
  return (
    <button type="submit" className="button-colored w-full">{props.text}</button>
  );
};

export default SubmitButton;
