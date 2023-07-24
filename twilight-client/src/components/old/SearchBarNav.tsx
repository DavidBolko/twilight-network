import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { CDN, fetcher } from "../utils";
import { FC, useState } from "react";
import { useSearchParams } from "react-router-dom";

type data = [
  {  displayName: string;
    desc: string;
    Img: string;
  }
]

const SearchBarNav:FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [result, setResult] = useState<data>()

  const handleChange = async (value: string) => {
    setSearchValue(value);
    if (value.length > 0) {
      const res = await fetch("/api/c/search/" + value.toLocaleLowerCase(), {
        method: "GET",
      });
      const body:data = await res.json();
      setResult(body)
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };
  const close = (value:string) =>{
    setCollapsed(false)
    window.location.replace(`/c/${value.toLowerCase()}`)
  }

  return (
    <div className="flex flex-col absolute left-1/2 right-1/2 -translate-x-1/2 top-3 h-fit p-1.5 min-w-[450px] border-2 bg-slate-800/60 backdrop-blur-sm border-slate-500 rounded-md">
      <div className="flex gap-1 min-w-[450px]">
        <MagnifyingGlassIcon width={24} />
        <input
          placeholder="Community"
          type="text"
          className="w-full"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <div className={`p-2${collapsed ? "visible" : "hidden"}`}>
        {result?.map((ele) =>
          <button className="flex gap-2 hover:bg-violet-600/40 w-full p-1 rounded-md" onClick={()=>close(ele.displayName)}>
            <img
              src={CDN(ele.Img)}
              className="w-6 h-6 object-cover rounded-full"
            />
            <p>{ele.displayName}</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBarNav;
