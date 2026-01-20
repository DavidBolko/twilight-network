import { useState, type SyntheticEvent } from "react";
import { HeartIcon } from "lucide-react";

import { queryClient } from "../main";
import api from "../axios";
import axios from "axios";

type props = {
  filled: boolean;
  count: number;
  id: string;
};

export default function LikeButton(props: props) {
  const [filled, setFilled] = useState(props.filled);
  const [count, setCount] = useState(props.count);

  const setLike = async (e:SyntheticEvent) => {
    e.stopPropagation()
    try {
      const response = await api.put(
        `${import.meta.env.VITE_API_URL}/p/${props.id}/like`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["community"] });
        setFilled(!filled);
        setCount((prev) => (filled ? prev - 1 : prev + 1));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          window.location.href = "/auth/login";
        }
      } else {
        console.error("Unexpected error", error);
      }
    }
  };

  return (
    <div className="flex gap-1 text-sm ml-2 items-center">
      <button onClick={setLike} className="flex items-center hover:cursor-pointer hover:">
        {filled ? <HeartIcon fill="white" className="w-4 h-4 hover:" /> : <HeartIcon className="w-4 h-4" />}
      </button>
      <p>{count} likes</p>
    </div>
  );
}
