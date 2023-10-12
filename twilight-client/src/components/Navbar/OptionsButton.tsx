import { CaretDownIcon, Cross1Icon } from "@radix-ui/react-icons"
import { FC } from "react"
import { CDN } from "../../utils"

type props = {
  options: boolean,
  avatar: string
  open: Function
}

const OptionsButton:FC<props> = (props) =>{
  return(
    <button className={`flex items-center align-middle hover:dark:bg-twilight-600 hover:bg-twilight-300 p-1 pl-2 rounded-md ${props.options?" bg-twilight-300 dark:bg-twilight-500 hover:dark:bg-twilight-500 hover:bg-twilight-300":"bg-transparent"}`} onClick={(e)=>props.open(!props.options)}>
      <img src={CDN(`${props.avatar ? props.avatar : "default.svg"}`)} alt="" className="w-8 h-8 border-2 border-twilight-white-300/70 rounded-full object-cover"/>
      {props.options?
      <Cross1Icon width={20} height={12}/> 
      :<CaretDownIcon width={20} height={16}/>
      }
    </button>
  )
}

export default OptionsButton