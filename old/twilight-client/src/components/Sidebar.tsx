import { HomeIcon } from "@heroicons/react/24/solid";
import { FC } from "react";

export const Sidebar: FC = () => {
  return (
    <nav className="flex p-4 bg-slate-700 h-full">
      <ul className="flex md:flex-col gap-2">
        <li>
          <a href="">
            <p className="text-xs">Home</p>
          </a>
        </li>
        <li>
          <a href="">
            <p className="text-xs">Home</p>
          </a>
        </li>
      </ul>
    </nav>
  );
};
