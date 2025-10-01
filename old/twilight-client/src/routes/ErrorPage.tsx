import { ServerStackIcon } from "@heroicons/react/24/solid";
import { FC } from "react";
import { useRouteError } from "react-router-dom";

interface props{
  status:number,
  statusText:string
}

const ErrorPage:FC<props> = (props) => {
  return (
    <div className="flex flex-col-reverse justify-center items-center h-screen">
      <p>{props.status}</p>
      <p>{props.statusText}</p>
      <ServerStackIcon width={128} />
    </div>
  );
};

export default ErrorPage;
