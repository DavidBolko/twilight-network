import { Switch } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useContext, useState } from "react";
import { ThemeContext } from "../../store";

const DarkModeToggler = () => {
  const theme = useContext(ThemeContext)
  const [enabled, setEnabled] = useState(theme);
  
  const handleChange = ()=>{
    localStorage.setItem("darkMode", String(!enabled))
    setEnabled(!enabled)
  }
  if(enabled){
    return (
      <button type="button" onClick={handleChange}><MoonIcon className="text-glow" width={20} height={20}/></button>
    );
  }
  return (
    <button type="button" onClick={handleChange}><SunIcon width={20} height={20}/></button>
  );
};

export default DarkModeToggler;
