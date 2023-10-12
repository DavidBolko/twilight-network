import { FC } from "react"
import { CDN } from "../utils"
import { ShieldCheckIcon } from "lucide-react"

const CommunityCard:FC<props> = (props) =>{
    return(
        <div className="card flex-row">
            <img src={CDN(props.Img)} className="h-32 w-32 border border-twilight-dark-500 rounded-full"/>
            <div className="flex flex-col gap-2 text-justify">
                <div className="flex items-center gap-2">
                    <p className="text-lg">{props.name}</p>
                    {props.moderator
                    ? <div className="flex items-center"><ShieldCheckIcon className="text-twilight-white-300/60" width={20} height={20}/><p className="text-twilight-white-300/60 text-xs">Moderator</p></div>
                    : ""
                    }
                </div>
                <p className="text-xs">{props.desc}</p>
            </div>
            <button className="button-colored h-fit self-center ml-auto">Follow</button>
        </div>
    )
}

export default CommunityCard

type props = {
    id:string,
    name:string,
    desc:string,
    Img:string,
    moderator:boolean
}