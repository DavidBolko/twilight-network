import { FC, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../store";
import axios from "axios";
import { LogOut, Settings, UserIcon, UsersIcon } from "lucide-react";

interface props {
  visible: boolean;
  setVisible: Function;
}

const OptionsCard: FC<props> = (props) => {
  const navigate = useNavigate();

  const user = useContext(UserContext);

  const logout = async() =>{
    const res = await axios.post("/api/auth/logout")
    if(res.status == 200){
      navigate(0)
    }
  }
  
  return createPortal(
    <div className={`flex items-center justify-center fixed top-16 right-2 h-fit-z-0 ${props.visible ? "visible expanded" : "hidden"}`}>
      <div className={`relative card p-2 rounded-b-md dark:shadow-glow dark:bg-twilight-700/80 backdrop-blur-md options h-full  ${props.visible ? "expanded" : ""}`}>
        <ul className="flex flex-col text-md relative">
          <li>
            <a className="button-normal" onClick={() => navigate("/c/create")}>
              <UsersIcon className="icon " width={20} height={20} />
              <p>Create a community</p>
            </a>
          </li>
          <span className="w-full border-t border-t-twilight-300 dark:border-t-twilight-500 mt-1 mb-1"/>
          <li>
            <a className="button-normal" href={`/profile/${user.id}`}>
              <UserIcon width={20} height={20} />
              <p>Profile</p>
            </a>
          </li>
          <li>
            <a className="button-normal" onClick={() => navigate("/profile/settings")}>
              <Settings width={20} height={20} />
              <p>Settings</p>
            </a>
          </li>
          <span className="w-full border-t border-t-twilight-300 dark:border-t-twilight-500 mt-1 mb-1"/>
          <li>
            <a className="button-normal rounded-none" onClick={logout}>
              <LogOut width={20} height={20} />
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
