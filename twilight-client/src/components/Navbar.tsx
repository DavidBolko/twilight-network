import OptionsCard from "./OptionsCard";
import { FC, useState } from "react";
import { CDN,} from "../utils";
import SearchBarNav from "./SearchBarNav";
import DarkModeToggler from "./Navbar/DarkModeToggler";
import { useNavigate } from "react-router-dom";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { CaretDownIcon, Cross1Icon } from "@radix-ui/react-icons";

type props = {
  img: string
}

const Navbar:FC<props> = (props) => {
  const navigate = useNavigate()
  const [options, openOptions] = useState(false)
  return (
    <>
      <OptionsCard visible={options} setVisible={()=>openOptions(!options)}/>
      <div className="grid grid-cols-3 w-full p-2 bg-twilight-100/60 dark:bg-twilight-600/60  before:absolute before:-z-10 before:content-[''] shadow-sm before:w-full before:h-full before:backdrop-blur-sm z-10 fixed items-center">
        <a className="text-4xl  font-bold text-moonlight-300 dark:text-glow hover:drop-shadow-shadowFrost hover:cursor-pointer" onClick={()=>navigate("/")}>
          Twilight.
        </a>
        <SearchBarNav/>
        <div className="flex items-center gap-2 ml-auto">
          <DarkModeToggler/>
          <button className={`flex items-center align-middle hover:dark:bg-twilight-600 hover:bg-twilight-300 p-1 pl-2 rounded-md ${options?" bg-twilight-300 dark:bg-twilight-500 hover:dark:bg-twilight-500 hover:bg-twilight-300":"bg-transparent"}`} onClick={(e)=>openOptions(!options)}>
            <img src={CDN(props.img)} alt="" className="w-8 h-8 border border-nord-frost-300/50 rounded-full"/>
            {options?
            <Cross1Icon width={20} height={12}/> 
            :<CaretDownIcon width={20} height={16}/>
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
