import { BookmarkIcon } from "lucide-react";
import { useState, type SyntheticEvent } from "react";
import { api, ApiError } from "../api";

interface SaveButtonProps {
  postId: number;
  saved: boolean;
}

export const SaveButton = ({ postId, saved }: SaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(saved);

  const toggleSave = async (e: SyntheticEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);

    try {
      await api.put(`posts/${postId}/save`);
    } catch (err) {
      setIsSaved(isSaved);
      if (err instanceof ApiError && err.status === 401) {
        window.location.href = "/auth/login";
      }
    }
  };

  return (
    <button className="p-2 transition-colors" onClick={toggleSave}>
      <BookmarkIcon className=" w-4 h-4 hover:text-tw-primary text-white" fill={isSaved ? "currentColor" : "none"} />
    </button>
  );
};
