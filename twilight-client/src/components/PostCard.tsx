import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";
import { FC } from "react";
import { CDN, previewCDN } from "../utils";
import { useNavigate } from "react-router-dom";
import { Users } from "@phosphor-icons/react";
import { ChatBubbleIcon, DownloadIcon } from "@radix-ui/react-icons";

type props = {
  author: {
    name:string;
    displayName: string;
  };
  comments: number;
  community?: {
    name:string;
    displayName: string;
    id: string;
    Img: string;
  };
  likedBy:[
    {
      id: string
    }
  ]
  content: string;
  id: string;
  likeCount: number;
  title: string;
  refetch: Function
  cardType: string,
  type: string,
  preview?: boolean,
  liked: boolean
};

const PostCard: FC<props> = (props) => {
  const navigate = useNavigate();

  const likePost = async(id:string) =>{
    const res = await fetch("/api/p/like",{
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id:props.id})
    })
    if(res.ok){
      props.refetch()
    }
  }   
  
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <img src={CDN("898dde0c5e4360f80d790a1a92c18503.jpg")} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
        <div className="w-full">
          <p className="font-bold">{props.title}</p>
          <p className="text-xs">{"by " + props.author.name}</p>
        </div>
        {props.cardType == "com"
        ? ""
        : <a href="" onClick={()=>navigate(`/c/${props.community!.name}`)} className="flex items-center self-end text-xs font-normal dark:text-twilight-300 hover:text-moonlight-300 ml-auto"> <Users width={20} height={20}/> {props.community!.displayName}</a>
        }
      </div>
      <a href={`/p/${props.id}`} onClick={(e) => {e.preventDefault(), navigate(`/p/${props.id}`)}} className="hover:cursor-pointer h-fit">
        {props.type == "text"
        ? (props.preview == true ? <p className="break-words text-justify">{props.content.substring(0, 400) + "...."}</p> : <p className="break-words text-justify">{props.content}</p>)
        : <img src={previewCDN(props.content)} alt="" loading="lazy" className="rounded-lg scale-[.98] hover:scale-100 transition-all" />
        }
      </a>
      <div className="flex w-full">
        <div className="flex items-center gap-1 text-xs">
          {props.liked == true
          ?<button onClick={()=>likePost(props.id)}><HeartIconSolid width={24} height={24} className="text-moonlight-200 dark:text-glow hover:text-moonlight-300"/></button>
          :<button onClick={()=>likePost(props.id)}><HeartIcon width={24} height={24} className="hover:text-moonlight-300"/></button>
          }
          <p>{props.likeCount}</p>
        </div>
        <a href={`/api/cdn/${props.content}`} className="flex ml-auto mr-2 items-center hover:text-moonlight-200">
          <DownloadIcon width={20} height={20} />
        </a>
        <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex items-center gap-1 hover:text-moonlight-200">
          <ChatBubbleIcon width={20} height={20}/>
          <p className="text-sm">{props.comments}</p>
        </a>
      </div>
    </div>
  );
};

export default PostCard;
