import { ServerStackIcon } from "@heroicons/react/24/solid";
import { FC } from "react";
import { useRouteError } from "react-router-dom";

interface props{
  error: {
    status:number,
    text:string
  }
}

const ErrorPage:FC<props> = (props) => {
  return (
    <div className="">
      <p>{props.error.status}</p>
      <p>{props.error.text}</p>
      <ServerStackIcon width={128} />
    </div>
  );
};

export default ErrorPage;
