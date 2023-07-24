import { Combobox, Transition } from "@headlessui/react";
import { FC, Fragment, useState } from "react";
import { CDN } from "../utils";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";

type data = {
  displayName: string;
  name: string;
  id: string;
  _count:{
    Users: number,
  }
};

type props = {
  setCom?: Function
}

const SearchBarNav:FC<props> = (props) => {
  const navigate = useNavigate();

  const [selectedCom, setSelectedCom] = useState();
  const [query, setQuery] = useState<data[]>();
  
  const handleChange = async (value: string) => {
    if (value.length > 0) {
      const res = await fetch("/api/c/search/" + value.toLocaleLowerCase(), {
        method: "GET",
      });
      const body = await res.json();
      setQuery(body);
    }
  }; 

  if(query?.length!>0 && props.setCom==undefined){
    return (
      <div className="relative p-1  min-w-[450px] border-2 bg-nord-snow-300 dark:bg-nord-night-400 backdrop-blur-sm border-nord-frost-100/50 rounded-md">
        <Combobox value={selectedCom} onChange={setSelectedCom}>
          <div className="flex flex-col">
            <div className="flex justify-between">
              <Combobox.Input className="w-full" onChange={(event)=>handleChange(event.target.value)} />
              <Combobox.Button>
                <MagnifyingGlassIcon width={24}/>
              </Combobox.Button>
            </div>
            <Transition as={Fragment} enter="transition ease-in duration-100" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Combobox.Options className={"flex flex-col gap-2 rounded-md mt-10 border-2 p-2 border-nord-frost-200/70 absolute left-0 bg-nord-night-400/90 backdrop-blur-sm w-full"}>
                {query!.map((com) => (
                  <Combobox.Option key={com.id} value={com.name} className={"hover:bg-nord-frost-200/70 p-1.5 rounded-md"} onClick={()=>{window.location.replace("/c/"+com.name)}}>
                    <div className="flex gap-2 items-center">
                      <img src={CDN("default.svg")} className="w-8 h-8 border border-nord-frost-200/70 rounded-full"></img>
                      <div className="flex flex-col">
                        <p>{com.displayName}</p>
                        <p className="text-xs text-zinc-300">{com._count.Users} members</p>
                      </div>
                    </div>
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </div>
    )
  }
  return (
    <div className="relative p-1 w-fit md:min-w-[450px] border-2 bg-nord-snow-300 dark:bg-nord-night-400 backdrop-blur-sm border-nord-frost-200/50 rounded-md">
      <Combobox value={selectedCom} onChange={setSelectedCom}>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <Combobox.Input className="w-full" onChange={(event)=>handleChange(event.target.value)} />
            <Combobox.Button>
              <MagnifyingGlassIcon width={24}/>
            </Combobox.Button>
          </div>
        </div>
      </Combobox>
    </div>
  )
};

export default SearchBarNav;
