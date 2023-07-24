import OptionsCard from "./OptionsCard";
import { FC, useState } from "react";
import { CDN,} from "../utils";
import SearchBarNav from "./SearchBarNav";
import DarkModeToggler from "./Navbar/DarkModeToggler";
import { useNavigate } from "react-router-dom";

type props = {
  img: string
}

const Navbar:FC<props> = (props) => {
  const navigate = useNavigate()
  const [options, openOptions] = useState(false)
  return (
    <>
      <OptionsCard visible={options} setVisible={()=>openOptions(!options)}/>
      <div className="grid grid-cols-3 w-full p-2 bg-nord-snow-100/50 dark:bg-nord-night-300/50 backdrop-blur-sm fixed z-10 items-center">
        <a className="text-3xl  font-bold text-nord-frost-300 hover:drop-shadow-shadowFrost hover:cursor-pointer" onClick={()=>navigate("/")}>
          Twilight.
        </a>
        <SearchBarNav/>
        <div className="flex items-center gap-2 ml-auto">
          <DarkModeToggler/>
          <button className="align-middle" onClick={(e)=>openOptions(!options)}>
            <img src={CDN(props.img)} alt="" className="w-8 h-8 border border-nord-frost-300/50 rounded-full"/>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
