import { FC } from "react";
import { CDN, previewCDN } from "../utils";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "@phosphor-icons/react";
import { Bookmark, Download, Heart, MessageCircle } from "lucide-react";
import axios from "axios";
import { Post } from "../types";


interface props extends Post {
  comments: number
  likeCount: number;
  refetch: Function
  cardType: string,
  preview?: boolean,
  liked: boolean
  saved: boolean
};

const PostCard: FC<props> = (props) => {
  const navigate = useNavigate();

  const likePost = async(id:string) =>{
    const res = await fetch("/api/p/like",{
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id:id})
    })
    if(res.ok){
      props.refetch()
    }
  }

  const handleSave = async()=>{
    await axios.put("/api/p/"+props.id+"/save")
    props.refetch()
  }
  
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        {props.cardType == "profile"
        ? ""
        : <img src={CDN(props.author!.avatar)} loading="lazy" className="w-[48px] h-[48px] aspect-square rounded-full object-cover" />
        }
        <div className="flex flex-col w-full">
          <p className="font-bold text-base">{props.title}</p>
          {props.cardType == "profile"
          ? ""
          : <Link to={`/profile/${props.author.id}`} className="text-xs font-light text-twilight-300">{props.author!.name}</Link>
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
      <div className="flex w-full mt-auto justify-between">
        <div className="flex items-center gap-1 text-xs">
          <button onClick={()=>likePost(props.id)}><Heart strokeWidth={"1"} width={24} height={24} className={`hover:text-transparent hover:fill-moonlight-300 ${props.liked ? "fill-moonlight-200 text-transparent" : "fill-transparent"}`}/></button>
          <p>{props.likeCount}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex items-center gap-1 ">
            <Bookmark width={20} height={20} strokeWidth={"1"} className={`hover:text-transparent hover:fill-moonlight-300 ${props.saved ? "fill-moonlight-200 text-transparent" : "fill-transparent"}`}/>
          </button>
          {props.type != "text" ?
          <a href={`/api/cdn/${props.content}`} className="flex  items-center">
            <Download width={20} height={20} strokeWidth={"1"} className="hover:text-transparent hover:fill-moonlight-300"/>
          </a> : ""
          }
          <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex items-center gap-1">
            <MessageCircle width={20} height={20} strokeWidth={"1"} className="hover:text-transparent hover:fill-moonlight-300"/>
            <p className="text-sm">{props.comments}</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
