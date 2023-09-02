import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { FC, useContext } from "react";
import { ThemeContext } from "../../store";


const DarkModeToggler:FC = () => {
  const [darkMode, setTheme] = useContext(ThemeContext);
  const handleChange = () =>{
    if(darkMode == "false"){
      setTheme("true")
      localStorage.setItem('darkMode', "true")
    }
    else{
      setTheme("false")
      localStorage.setItem('darkMode', "false")
    }
  }
  if(darkMode=="true"){
    return (
      <button type="button" onClick={handleChange}><MoonIcon className="text-glow" width={20} height={20}/></button>
    );
  }
  return (
    <button type="button" onClick={handleChange}><SunIcon width={20} height={20}/></button>
  );
};

export default DarkModeToggler;
