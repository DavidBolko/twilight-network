import { FC } from "react";
import { CDN, previewCDN } from "../utils";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "@phosphor-icons/react";
import { Download, Heart, MessageCircle } from "lucide-react";


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
        {props.cardType == "profile"
        ? ""
        : <img src={CDN(props.author!.avatar)} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
        }
        <div className="flex flex-col w-full">
          <p className="font-bold text-base">{props.title}</p>
          {props.cardType == "profile"
          ? ""
          : <Link to={`/profile?user=${props.author!.name}`} className="text-xs font-light text-twilight-300">{props.author!.name}</Link>
          }
        </div>
        {props.cardType == "com"
        ? ""
        : <a href="" onClick={()=>navigate(`/c/${props.community!.id}`)} className="flex items-center self-end text-xs font-normal dark:text-twilight-300 hover:text-moonlight-300 ml-auto"> <Users width={20} height={20}/> {props.community!.name}</a>
        }
      </div>
      <a href={`/p/${props.id}`} onClick={(e) => {e.preventDefault(), navigate(`/p/${props.id}`)}} className="hover:cursor-pointer h-fit">
        {props.type == "text"
        ? (props.preview == true ? <p className="break-words text-justify">{props.content.substring(0, 400) + "...."}</p> : <p className="break-words text-justify">{props.content}</p>)
        : <img src={previewCDN(props.content)} alt="" loading="lazy" className="rounded-lg scale-[.98] hover:scale-100 transition-all" />
        }
      </a>
      <div className="flex w-full mt-auto">
        <div className="flex items-center gap-1 text-xs">
          {props.liked == true
          ?<button onClick={()=>likePost(props.id)}><Heart fill="#4F9EE3" width={24} height={24} className="text-moonlight-200 dark:text-glow hover:text-twilight-white-300"/></button>
          :<button onClick={()=>likePost(props.id)}><Heart width={24} height={24} className="hover:text-twilight-white-300"/></button>
          }
          <p>{props.likeCount}</p>
        </div>
        <a href={`/api/cdn/${props.content}`} className="flex ml-auto mr-2 items-center hover:text-moonlight-200">
          <Download width={20} height={20} />
        </a>
        <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex items-center gap-1 hover:text-moonlight-200">
          <MessageCircle width={20} height={20}/>
          <p className="text-sm">{props.comments}</p>
        </a>
      </div>
    </div>
  );
};

export default PostCard;

type props = {
  author?: {
    name:string;
    avatar: string
  };
  comments: number;
  community: {
    name :string;
    id: string;
    Img?: string;
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