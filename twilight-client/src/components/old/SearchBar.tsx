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

interface props{
  setCom: Function
  com: string
}

const SearchBar:FC<props> = (props) => {
  const [searchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(props.com);
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
    props.setCom(value)
    setCollapsed(false)
  }

  return (
    <div className="flex flex-col gap-2 p-1.5 absolute w-3/4 md:w-5/6 mr-auto top-0 border-2 h bg-slate-800/60 backdrop-blur-sm border-slate-500 rounded-md">
      <div className="flex gap-1 w-full">
        <MagnifyingGlassIcon width={24} />
        <input
          placeholder="Community"
          type="text"
          className="min-w-fit"
          value={searchValue}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
      <div className={`p-1 ${collapsed ? "visible" : "hidden"}`}>
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

export default SearchBar;
