import { BookmarkIcon } from "lucide-react";
import { useState } from "react";

import api from "../axios";

interface SaveButtonProps {
  postId: string;
  saved: boolean;
}

export const SaveButton = ({ postId, saved }: SaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(saved);

  const toggleSave = async () => {
    try {
      await api.put(
        `${import.meta.env.VITE_API_URL}/p/${postId}/save`,
        {},
        {
          withCredentials: true,
        },
      );
      setIsSaved(!isSaved);
    } catch (e) {
      console.error("Save toggle failed", e);
    }
  };

  return (
    <button className="p-2 transition-colors" onClick={toggleSave}>
      <BookmarkIcon className=" w-4 h-4 hover:text-tw-primary text-white" fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
};
