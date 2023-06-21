import { Cog6ToothIcon, UserIcon, UsersIcon } from "@heroicons/react/24/solid";
import { FC } from "react";

interface props {
  visible: boolean;
  setVisible: Function;
}

const OptionsCard: FC<props> = (props) => {
  return (
    <div
      className={`flex items-center justify-center fixed w-screen h-screen backdrop-blur-xl ${
        props.visible ? "visible" : "hidden"
      }`}
      onClick={(e) => props.setVisible(false)}
    >
      <div className="bg-slate-600 w-64 h-fit p-6 rounded-md">
        <p className="text-2xl">Options</p>
        <ul className="flex flex-col gap-2 text-lg border-t-2 pt-2">
		<li className="bg-slate-700 rounded-md p-2">
            <a className="flex">
              <UserIcon width={24} />
              <p>Profile</p>
            </a>
          </li>
          <li className="bg-slate-700 rounded-md p-2">
            <a className="flex">
              <UsersIcon width={24} />
              <p>Create a community</p>
            </a>
          </li>
          <li className="bg-slate-700 rounded-md p-2">
            <a className="flex">
              <Cog6ToothIcon width={24} />
              <p>Settings</p>
            </a>
          </li>
          <li className="bg-slate-700 rounded-md p-2">
            <a className="flex">
              <UserIcon width={24} />
              <p>Log out</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OptionsCard;
