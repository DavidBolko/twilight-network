import { FC } from "react";
import photo from "../../public/post.png";
import { CDN } from "../utils";

type User = {
  displayName: string;
  img: string;
};

type props = {
  content: string;
  author: User;
};

const Comment: FC<props> = (props) => {
  return (
    <div className="flex flex-col gap-2 h-fit shadow-twilight bg-twilight-100 dark:bg-twilight-800 rounded-md p-2 mt-2">
      <div className="flex items-center gap-2">
        <img
          src={CDN("898dde0c5e4360f80d790a1a92c18503.jpg")}
          className="w-8 h-8 rounded-full object-cover"
          alt=""
        />
        <p>{props.author.displayName}</p>
      </div>
      <p className="text-justify text-base break-words">{props.content}</p>
    </div>
  );
};

export default Comment;
