import { Switch } from "@headlessui/react";
import { Moon } from "@phosphor-icons/react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

const DarkModeToggler = () => {
  const [enabled, setEnabled] = useState(false);
 
  useEffect(()=>{
    const root = document.getElementById("document")
    const darkMode = localStorage.getItem("darkMode")
    setEnabled(darkMode == "true"? true:false)
    if(enabled == true){
        root!.classList.add("dark")
    }
    else{
        root?.classList.remove("dark")
    }
  }, [enabled])
  
  const handleChange = ()=>{
    localStorage.setItem("darkMode", String(!enabled))
    setEnabled(!enabled)
  }
  return (
    <Switch checked={enabled} onChange={handleChange} className={`${enabled ? "bg-nord-frost-300 shadow-shadowFrost" : "bg-nord-snow-300"} relative inline-flex h-6 w-11 items-center rounded-full`}>
      <span className="sr-only">Enable dark mode</span>
      <span className={`${enabled ? "translate-x-6" : "translate-x-1"} flex items-center justify-center h-6 w-6 transform rounded-full bg-white transition`}>{enabled==true ? <SunIcon className="text-black"/>: <MoonIcon/>}</span>
    </Switch>
  );
};

export default DarkModeToggler;
