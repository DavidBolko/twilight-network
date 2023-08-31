import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon as LikeSolid,
} from "@heroicons/react/24/solid";
import { HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import { FC } from "react";

const PostCardSkeleton:FC= () => {
  return (
    <div className="card">
      <div className="flex gap-2">
        <div className="w-[48px] h-[48px] rounded-full bg-twilight-white-300 dark:bg-twilight-dark-300"></div>
        <div className="flex flex-col gap-1 justify-center">
          <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none text-sm">Loremipsum</span>
          <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none text-xs">Lorem</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eaque, laudantium namn</span>
        <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none">Lorem ipsum dolor sit amet consectetur, adipisicing elit.</span>
        <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none">Lorem ipsum dolor sit amet consectetur.</span>
        <span className="bg-twilight-white-300 dark:bg-twilight-dark-300 rounded-md w-fit text-transparent animate-pulse select-none">Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit.</span>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
