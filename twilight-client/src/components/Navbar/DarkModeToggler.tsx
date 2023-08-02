import { Switch } from "@headlessui/react";
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
    console.log("asdasd");
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
