import { BookmarkIcon } from "lucide-react";
import { useState, type SyntheticEvent } from "react";

import api from "../axios";

interface SaveButtonProps {
  postId: string;
  saved: boolean;
}

export const SaveButton = ({ postId, saved }: SaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(saved);

  const toggleSave = async (e: SyntheticEvent) => {
    e.stopPropagation();
    try {
      await api.put(`/p/${postId}/save`);
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
