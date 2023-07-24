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
    <li className="flex shadow-lg bg-nord-snow-200 dark:bg-nord-night-400 rounded-md p-2 mt-2">
      <div>
        <div className="flex items-center gap-2">
          <img
            src={CDN("898dde0c5e4360f80d790a1a92c18503.jpg")}
            className="w-12 h-12 rounded-full object-cover"
            alt=""
          />
          <p>{props.author.displayName}</p>
        </div>
        <p className="text-justify">{props.content}</p>
      </div>
    </li>
  );
};

export default Comment;
