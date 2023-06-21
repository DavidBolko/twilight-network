import photo from "../../public/post.png";
import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon as LikeSolid,
} from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import avatar from "../../public/post.png";



const PostCard = () => {
  return (
    <li>
      <div className="flex flex-col bg-slate-700 p-4 rounded-lg">
        <div className="flex items-center">
          <img
            src={avatar}
            alt=""
            className="rounded-full p-2 w-16 h-16 object-cover"
          />
          <div>
            <p className="font-bold">Witcher</p>
            <p className="text-xs">by TheSillus</p>
          </div>
        </div>
        <img src={photo} alt="" className="rounded-lg mb-4" />
        <div className="flex w-full">
          <LikeOutline width={24} />
          <div className="flex ml-auto items-center">
            <ChatBubbleOvalLeftIcon width={24} />
            <p className="text-sm">6520</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PostCard;
