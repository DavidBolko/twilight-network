import { UserCircleIcon } from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import OptionsCard from "./OptionsCard";
import { useState } from "react";


const Navbar = () => {
  const [options, openOptions] = useState(false)
  return (
    <>
      <OptionsCard visible={options} setVisible={openOptions}/>
      <div className="flex gap-8 w-full p-2 bg-slate-700/60 backdrop-blur-md border-b border-b-slate-500 fixed">
        <a className="text-5xl font-bold text-violet-500" href="">
          Twilight.
        </a>
        <div className="flex border-2 border-slate-500 hover:border-slate-400 active:border-white rounded-3xl h-fit p-1.5 self-center">
          <MagnifyingGlassIcon width={24} />
          <input type="text" className="min-w-fit"/>
        </div>
        <div className="ml-auto self-center">
          <button className="align-middle" onClick={(e)=>openOptions(true)}>
            <UserCircleIcon width={32} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
