import axios from "axios"
import { FC, useEffect, useState } from "react"

type props = {
    callback: Function,
    type: string
}

const SearchBar:FC<props> = (props) => {
    const [open, setOpen] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [data, setData] = useState<data[]>()

    const [selected, setSelected] = useState("")

    const handleSearch = async(value:string) =>{
        setSearchInput(value)
        const res = await axios.get("/api/c/search/" + value, {
            method: "GET",
        });
        setData(res.data)
        console.log(res.data);
    }
    const handleClick = (name: string, value:string) =>{
        console.log(value);
        
        setSelected(name)
        props.callback(value)
    }

    useEffect(()=>{
        setSelected("")
        props.callback("")
      }, [searchInput])

    return(
        <div className="relative w-full  z-20">
            <div className="absolute form-input-w-svg p-0" onFocus={()=>setOpen(true)} onBlur={e => e.relatedTarget === null && setOpen(false)}>
                <input required className="w-full" value={`${selected ? selected : searchInput}`}  type="text" onChange={(e)=>{handleSearch(e.target.value), setSelected(e.target.value)}}/>
                {data ?
                <ul className={`${open && data && searchInput  ? "block":"hidden"} p-2 border-t-2 z-30 border-t-twilight-500 backdrop-blur-md`}>
                    {data.map((ele) => (
                        <li className="hover:bg-twilight-dark-500/30 p-1 rounded-md">
                            <p onMouseDown={()=>handleClick(ele.name, ele.id)}>{ele.name}</p>
                        </li>
                    ))}
                </ul>
                : ""
                }
            </div>
        </div>
    )
}

type data = {
    id: string,
    name: string,
}

export default SearchBar