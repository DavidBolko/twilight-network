import photo from "../../public/post.png";
import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon as LikeSolid,
} from "@heroicons/react/24/solid";
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
  community: {
    displayName: string;
    id: string;
    Img:string
  };
  content: string;
  type: string;
  id: string;
  likes: number;
  title: string;
  userId: string;
};

const PostCard:FC<props> = (props) => {
  const navigate = useNavigate()
  return (
    <li className="min-w-full">
      <div className="postCard">
        <div className="flex items-center">
          <img
            src={CDN(props.community.Img)}
            alt=""
            className="rounded-full p-2 w-16 h-16 object-cover"
          />
          <div>
            <p className="font-bold">{props.title}</p>
            <p className="text-xs">by {props.author.displayName}</p>
          </div>
        </div>
        <a onClick={()=>navigate(`/p/${props.id}`)} className="hover:cursor-pointer"><img src={CDN(props.content)} alt="" className="rounded-lg mb-4 scale-[.98] hover:scale-100 transition-all" /></a>
        <div className="flex w-full">
          <LikeOutline width={24} />
          <a href={`/p/${props.id}`} className="flex ml-auto items-center">
            <ChatBubbleOvalLeftIcon width={24} />
            <p className="text-sm">{props.comments}</p>
          </a>
        </div>
      </div>
    </li>
  );
};

export default PostCard;
