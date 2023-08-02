import photo from "../../public/post.png";
import { ChatBubbleOvalLeftIcon, HandThumbUpIcon as LikeSolid } from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import avatar from "../../public/post.png";
import { FC } from "react";
import { CDN } from "../utils";
import { useNavigate } from "react-router-dom";

type props = {
  author: {
    displayName: string;
  };
  comments: number;
  community?: {
    displayName: string;
    id: string;
    Img: string;
  };
  content: string;
  type?: string;
  id: string;
  likeCount: number;
  title?: string;
  userId?: string;
  liked?:boolean,
  refetch: Function
  cardType: string
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
  if(props.cardType == "com"){
    return (
      <li className="min-w-full">
        <div className="card">
          <a onClick={() => navigate(`/p/${props.id}`)} className="hover:cursor-pointer">
            <img src={CDN(props.content)} alt="" className="rounded-lg scale-[.98] hover:scale-100 transition-all" />
          </a>
          <div className="flex w-full">
            <div className="flex items-center gap-1 text-xs">
              {props.liked
              ?<button onClick={()=>likePost(props.id)}><LikeSolid width={24} className="text-moonlight-200 hover:text-moonlight-300"/></button>
              :<button onClick={()=>likePost(props.id)}><LikeOutline width={24} className="hover:text-moonlight-300"/></button>
              }
              <p>{props.likeCount}</p>
            </div>
            <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex ml-auto items-center hover:text-moonlight-200">
              <ChatBubbleOvalLeftIcon width={24} />
              <p className="text-sm">{props.comments}</p>
            </a>
          </div>
        </div>
      </li>
    );
  }  
  return (
    <li className="min-w-full">
      <div className="card">
        <div className="flex items-center">
          <img src={CDN(props.community!.Img)} alt="" className="rounded-full p-2 w-16 h-16 object-cover" />
          <div>
            <p className="font-bold">{props.title}</p>
            <p className="text-xs">by {props.author.displayName}</p>
          </div>
        </div>
        <a onClick={() => navigate(`/p/${props.id}`)} className="hover:cursor-pointer">
          <img src={CDN(props.content)} alt="" className="rounded-lg scale-[.98] hover:scale-100 transition-all" />
        </a>
        <div className="flex w-full">
          <div className="flex items-center gap-1 text-xs">
            {props.liked
            ?<button onClick={()=>likePost(props.id)}><LikeSolid width={24} className="text-moonlight-200 hover:text-moonlight-300"/></button>
            :<button onClick={()=>likePost(props.id)}><LikeOutline width={24} className="hover:text-moonlight-300"/></button>
            }
            <p>{props.likeCount}</p>
          </div>
          <a href="#" onClick={() => navigate(`/p/${props.id}`)} className="flex ml-auto items-center hover:text-moonlight-200">
            <ChatBubbleOvalLeftIcon width={24} />
            <p className="text-sm">{props.comments}</p>
          </a>
        </div>
      </div>
    </li>
  );
};

export default PostCard;
