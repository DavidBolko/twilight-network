import { SignOut, Gear, User, Users, X } from "@phosphor-icons/react";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface props {
  visible: boolean;
  setVisible: Function;
}

const OptionsCard: FC<props> = (props) => {
  const navigate = useNavigate();
  return createPortal(
    <div className={`flex items-center justify-center fixed top-14 right-0 z-30 h-full ${props.visible ? "visible expanded" : "hidden"}`}>
      <div className={`relative card rounded-none shadow-none dark:bg-twilight-700/80 backdrop-blur-md options h-full ${props.visible ? "expanded" : ""}`}>
        <div className="flex items-center justify-between">
          <p className="text-xl">Options</p>
        </div>
        <ul className="flex flex-col gap-2 text-md relative">
          <li>
            <a className="button-normal" onClick={() => navigate("/profile")}>
              <User weight="fill" width={24} height={24} />
              <p>Profile</p>
            </a>
          </li>
          <li>
            <a className="button-normal " onClick={() => navigate("/c/create")}>
              <Users weight="fill" className="icon " width={24} height={24} />
              <p>Create a community</p>
            </a>
          </li>
          <li>
            <a className="button-normal" onClick={() => navigate("/profile/settings")}>
              <Gear weight="fill" width={24} height={24} />
              <p>Settings</p>
            </a>
          </li>
          <li>
            <a className="button-normal" onClick={() => navigate("/auth/signout")}>
              <SignOut weight="fill" width={24} height={24} />
              <p>Log out</p>
            </a>
          </li>
        </ul>
      </div>
    </div>,
    document.body
  );
};

export default OptionsCard;
