import OptionsCard from "../OptionsCard";
import { FC, useContext, useState } from "react";
import DarkModeToggler from "./DarkModeToggler";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../store";
import OptionsButton from "./OptionsButton";
import SearchBar from "../SearchBar";


const Navbar:FC = () => {
  const navigate = useNavigate()
  const [options, openOptions] = useState(false)
  const [search, setSearch] = useState("")

  const navigateCallback = (value:string) =>{
    setSearch(value)
    if(search){
      navigate("/c/"+search)
    }
  }
  
  const user = useContext(UserContext);
  return (
    <>
      <OptionsCard visible={options} setVisible={()=>openOptions(!options)}/>
      <div className="grid grid-cols-3 w-full p-2 bg-twilight-100/60 dark:bg-twilight-600/60  before:absolute before:-z-10 before:content-[''] shadow-sm before:w-full before:h-full before:backdrop-blur-sm z-10 fixed">
        <a className="text-4xl  font-bold text-moonlight-300 dark:text-glow hover:drop-shadow-shadowFrost hover:cursor-pointer" onClick={()=>navigate("/")}>
          Twilight.
        </a>
        <SearchBar type="" callback={navigateCallback}/>
        <div className="flex items-center gap-2 ml-auto">
          <DarkModeToggler/>
          {user.id
          ? <OptionsButton open={openOptions} avatar={user.avatar} options={options}/>
          : <a href="/auth" className="button-colored">Log In</a>
          }
        </div>
      </div>
    </>
  );
};

export default Navbar;

