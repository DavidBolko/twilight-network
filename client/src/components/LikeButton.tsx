import { useState, type SyntheticEvent } from "react";
import { HeartIcon } from "lucide-react";
import { api, ApiError } from "../api";

type Props = {
  filled: boolean;
  count: number;
  id: number;
};

export default function LikeButton({ filled: initialFilled, count: initialCount, id }: Props) {
  const [filled, setFilled] = useState(initialFilled);
  const [count, setCount] = useState(initialCount);

  const setLike = async (e: SyntheticEvent) => {
    e.stopPropagation();

    setFilled(!filled);
    setCount((prev) => (filled ? prev - 1 : prev + 1));

    try {
      await api.put(`posts/${id}/like`);
    } catch (err) {
      setFilled(filled);
      setCount(initialCount);

      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
      }
    }
  };

  return (
    <div className="flex gap-1 text-sm ml-2 items-center">
      <button onClick={setLike} className="flex items-center hover:cursor-pointer">
        {filled ? <HeartIcon fill="white" className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
      </button>
      <p>{count} likes</p>
    </div>
  );
}
