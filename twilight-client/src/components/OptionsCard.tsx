import { SignOut, Gear, User, Users, X } from "@phosphor-icons/react";
import { FC, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../store";
import { CDN } from "../utils";

interface props {
  visible: boolean;
  setVisible: Function;
}

const OptionsCard: FC<props> = (props) => {
  const navigate = useNavigate();

  const user = useContext(UserContext);
  
  return createPortal(
    <div className={`flex items-center justify-center fixed top-16 right-2 h-fit-z-0 ${props.visible ? "visible expanded" : "hidden"}`}>
      <div className={`relative card rounded-b-md dark:shadow-glow dark:bg-twilight-700/80 backdrop-blur-md options h-full  ${props.visible ? "expanded" : ""}`}>
        <div className="flex gap-2">
          <img src={CDN(user.avatar)} className="w-16 h-16 border border-twilight-white-300 rounded-full object-cover" alt="" />
          <div className="flex flex-col mt-2">
            <p>{user.displayName}</p>
            <p className="text-sm text-twilight-500">Options</p>
          </div>
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
