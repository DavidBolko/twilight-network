import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon as LikeSolid,
} from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import { FC } from "react";

const PostCardSkeleton:FC= () => {
  return (
    <li className="w-full">
      <div className="postCard">
        <div className="flex items-center w-full">
          <span className="h-16 w-16 rounded-full bg-nord-snow-300 dark:bg-nord-night-400 animate-pulse"/>
          <div className="flex flex-col gap-1">
            <span className="ml-1 w-16 h-4 rounded-md  bg-nord-snow-300 dark:bg-nord-night-400 animate-pulse"/>
            <span className="ml-1 w-8 h-3 rounded-md bg-nord-snow-300 dark:bg-nord-night-400 animate-pulse"/>
          </div>
        </div>
        <span className="h-[400px] w-full rounded-md  bg-nord-snow-300 dark:bg-nord-night-400 animate-pulse"/>
        <div className="flex w-full">
          <LikeOutline width={24} />
          <span className="ml-1 w-8 h-6 rounded-md bg-nord-snow-300  dark:bg-nord-night-400 animate-pulse"/>
          <div className="flex ml-auto items-center">
            <ChatBubbleOvalLeftIcon width={24} />
            <span className="ml-1 w-8 h-6 rounded-md bg-nord-snow-300 dark:bg-nord-night-400 animate-pulse"/>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PostCardSkeleton;
