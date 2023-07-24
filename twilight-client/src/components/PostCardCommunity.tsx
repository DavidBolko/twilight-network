import photo from "../../public/post.png";
import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon as LikeSolid,
} from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import { FC } from "react";
import { CDN } from "../utils";
import placeholder from "../../src/assets/placeholder.jpg"

interface props{
  img: string,
  author: string,
  comments: number,
  likes: number
}

const PostCardCommunity:FC<props> = (props) => {
  return (
    <li>
      <div className="postCard">
        <p className="text-xs mb-2">by {props.author}</p>
        <img src={CDN(props.img)} alt="" className="rounded-lg mb-4" loading="lazy"/>
        <div className="flex w-full">
          <LikeOutline width={24} />
          <p>{props.likes}</p>
          <div className="flex ml-auto items-center">
            <ChatBubbleOvalLeftIcon width={24} />
            <p className="text-sm">{props.comments}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PostCardCommunity;
