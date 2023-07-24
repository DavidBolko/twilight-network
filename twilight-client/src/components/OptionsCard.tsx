import { SignOut, Gear, User, Users, X } from "@phosphor-icons/react";
import { FC } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

interface props {
  visible: boolean;
  setVisible: Function;
}

const OptionsCard: FC<props> = (props) => {
  const navigate = useNavigate()
  return createPortal(
    <div className={`flex items-center justify-center fixed top-20 right-4 ${props.visible ? "visible" : "hidden"}`}>
      <div className="bg-nord-snow-200 shadow-shadowNord dark:shadow-shadowFrost dark:bg-nord-night-300 h-fit p-6 rounded-md">
        <div className="flex items-center justify-between">
          <p className="text-xl">Options</p>
          <X width={24} height={24} className="hover:cursor-pointer hover:text-nord-frost-200" onClick={(e) => props.setVisible(false)}/>
        </div>
        <ul className="flex flex-col gap-2 pt-2 text-md">
          <li>
            <a className="button-normal"  onClick={()=>navigate("/profile")}>
              <User width={24} height={24} />
              <p>Profile</p>
            </a>
          </li>
          <li>
            <a className="button-normal "  onClick={()=>navigate("/c/create")}>
              <Users width={24} height={24} />
              <p>Create a community</p>
            </a>
          </li>
          <li>
            <a className="button-normal"  onClick={()=>navigate("/profile/settings")}>
              <Gear width={24} height={24} />
              <p>Settings</p>
            </a>
          </li>
          <li>
            <a className="button-normal" onClick={()=>navigate("/auth/signout")}>
              <SignOut width={24} height={24} />
              <p>Log out</p>
            </a>
          </li>
        </ul>
      </div>
    </div>
  ,document.body);
};

export default OptionsCard;
