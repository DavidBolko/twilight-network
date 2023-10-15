import { FC } from "react"
import { CDN } from "../utils"
import { CheckIcon, ShieldCheckIcon } from "lucide-react"

const CommunityCard:FC<props> = (props) =>{

    let moderator = false;
    let followed = false;
    for(const mod of props.community.Moderators){
        if(!moderator){
            moderator = mod.id == props.userID
        }
        console.log(mod);
    }
    for(const user of props.community.Users){
        if(!followed){
            followed = user.id == props.userID
        }
    }

    const handleFollow = async () => {
        const res = await fetch(`/api/c/${props.community.id}/follow`, {
          method: "PUT",
          body: "",
        });
        if (res.ok) {
            props.refetch(0);
        }
      };

    return(
        <div className="card flex-row justify-between items-center">
            <div className="flex gap-6 flex-row">
                <img src={CDN(props.community.Img)} className="h-32 w-32 border object-cover border-twilight-dark-500 rounded-full"/>
                <div className="flex flex-col gap-2 text-justify">
                    <div className="flex items-center gap-2">
                        <p className="text-lg">{props.community.name}</p>
                        {moderator
                        ? <div className="flex items-center"><ShieldCheckIcon className="text-twilight-white-300/60" width={20} height={20}/><p className="text-twilight-white-300/60 text-xs">Moderator</p></div>
                        : ""
                        }
                    </div>
                    <p className="text-xs">{props.community.desc}</p>
                </div>
            </div>
            {followed ? (
              <button className="button-colored-active flex items-center" onClick={handleFollow}>
                <span><CheckIcon width={20} height={20} /></span>Followed
              </button>
            ) : (
              <button className="button-colored" onClick={handleFollow}>Follow</button>
            )}
        </div>
    )
}

export default CommunityCard

type props = {
    refetch: Function,
    userID: string,
    community:{
        id: string;
        name: string;
        desc: string;
        Img: string;
        Moderators:[
            {id:string}
        ]
        Users:[{
            id: string,
        }]
    }
}
