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
  value?: string
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
      <div className="relative p-1.5 dark:text-white shadow-md dark:shadow-glow dark:bg-twilight-700/80 bg-twilight-100/70 rounded-md ">
        <Combobox value={selectedCom} onChange={setSelectedCom}>
          <div className="flex flex-col">
            <div className="flex justify-between">
              <Combobox.Input className="w-full bg-transparent" onChange={(event)=>handleChange(event.target.value)} />
              <Combobox.Button>
                <MagnifyingGlassIcon width={24}/>
              </Combobox.Button>
            </div>
            <Transition as={Fragment} enter="transition ease-in duration-100" enterFrom="opacity-0" enterTo="opacity-100" leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Combobox.Options className={"flex flex-col gap-2 rounded-md mt-12 p-2 dark:shadow-glow shadow-twilight absolute left-0 bg-twilight-100 dark:bg-twilight-800/90 z-0 w-full"}>
                {query!.map((com) => (
                  <Combobox.Option key={com.id} value={com.name} className={"hover:shadow-twilight hover:bg-moonlight-300/40 hover:cursor-pointer p-1.5 rounded-md hover:animate-pulse"}>
                    <a href={"/c/"+com.name} className="flex gap-2 items-center">
                      <img src={CDN("default.svg")} className="w-8 h-8 border border-twilight-200/70 rounded-full"></img>
                      <div className="flex flex-col">
                        <p>{com.displayName}</p>
                        <p className="text-xs text-twilight-400">{com._count.Users} members</p>
                      </div>
                    </a>
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
    <div className="relative p-1.5 w-full dark:text-white bg-twilight-100/70 shadow-md dark:shadow-glow dark:bg-twilight-dark-400/40 backdrop-blur-sm border-nord-frost-200/50 rounded-md">
      <Combobox value={selectedCom} onChange={setSelectedCom}>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <Combobox.Input className="w-full bg-transparent" placeholder={props.value} onChange={(event)=>handleChange(event.target.value)} />
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
