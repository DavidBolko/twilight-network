import { FC, useRef, useState } from "react"
import { CDN } from "../../utils"
import { CheckIcon, Pencil1Icon } from "@radix-ui/react-icons"
import axios from "axios"

type props = {
  user:{
    avatar:string,
    name:string,
    description: string
  },
  logged: boolean,
  refetch: Function
}

const UserCard:FC<props> = (props) =>{
  const [editing, setEditing] = useState(false)
  const [_desc, setDesc] = useState(props.user.description)
  const [file, setFile] = useState<File>();

  const saveChanges = async() =>{
    const res = await axios.post("/api/user/update", {
      desc: _desc,
      file: file,
    },
    {
      headers:{
        'Content-Type': 'multipart/form-data'
      }
    })
    if(res.status == 200){
      props.refetch()
    }
  }
  
  if(props.logged && editing==false){
    return(
      <section className="grid grid-cols-userCard gap-2 pt-12">
        <img src={CDN(props.user.avatar)} alt="" className="object-cover border-2 border-twilight-white-300/30 rounded-full sm:max-w-[200px] lg:max-h-[200px] "/>
        <div className="flex flex-col md:gap-2 justify-evenly text-justify">
          <div className="flex items-center justify-between">
            <h1 className="text-xl">{props.user.name}</h1>
            <Pencil1Icon className="cursor-pointer hover:text-moonlight-200" width={20} height={20} onClick={()=>setEditing(true)}/>
          </div>
          <p className="dark:text-slate-400 text-slate-600 text-sm md:text-base">{props.user.description}</p>
        </div>
      </section>
    )
  }
  else if(props.logged && editing){
    return(
      <section>
        <form className="grid grid-cols-userCard gap-2 pt-12">
          <div className="w-48 h-48 border border-nord-frost-300/50 rounded-full">
            <label htmlFor="avatar" className="hidden">Avatar Image</label>
            <input type="file" name="avatar" className="absolute opacity-0 h-[200px] w-[200px] z-20 cursor-pointer"  onChange={(e)=>setFile(e.target.files![0])}/>
            <img src={CDN(props.user.avatar)} alt="" className="bg-twilight-white-300/30 animate-pulse rounded-full w-48"/>
          </div>
          <div className="flex flex-col  justify-evenly text-justify">
            <div className="flex items-center justify-between">
              <h1 className="text-xl">{props.user.name}</h1>
              <CheckIcon className="cursor-pointer hover:text-moonlight-200" width={20} height={20} onClick={()=>{saveChanges(), setEditing(false)}}/>
            </div>
            <div className="bg-twilight-white-300/30 animate-pulse rounded-md h-fit">
              <textarea className="resize-none bg-transparent w-full overflow-hidden text-sm md:text-base p-1" placeholder={props.user.description} rows={3} maxLength={220} onChange={(e)=>setDesc(e.target.value)} value={_desc}/>
            </div>
          </div>
        </form>
      </section>
    )
  }
  return(
    <section className="grid grid-cols-userCard gap-2 pt-12">
      <img src={CDN(props.user.avatar)} alt="" className="object-cover border-2 border-twilight-white-300/30 rounded-full sm:max-w-[200px] lg:max-h-[200px] "/>
      <div className="flex flex-col md:gap-2 justify-evenly text-justify">
        <div className="flex items-center justify-between">
          <h1 className="text-xl">{props.user.name}</h1>
        </div>
        <p className="dark:text-slate-400 text-slate-600 text-sm md:text-base">{props.user.description}</p>
      </div>
    </section>
  )
}

export default UserCard;