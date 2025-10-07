import { useEffect, useState } from "react";
import type { FullUser } from "../types";
import { getFromCdn } from "../utils";
import axios from "axios";
import { Loader2Icon, LoaderIcon } from "lucide-react";

interface UserProfileProps {
  data: FullUser;
  id: string;
  refetch: () => void;
}

export const UserProfile = ({ data, id, refetch }: UserProfileProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [debouncedDescription, setDebouncedDescription] = useState(description);
  const [isUploading, setIsUploading] = useState(false);

  // Debounce zmeny popisu (odošleme až ked sa prestane pisať)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDescription(description), 500);
    return () => clearTimeout(handler);
  }, [description]);

  // odoslanie popisu pri zmene popisu
  useEffect(() => {
    if (debouncedDescription !== data.description) {
      const formData = new FormData();
      formData.append("description", debouncedDescription);
      axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/description`, formData, {
        withCredentials: true,
      });
    }
  }, [debouncedDescription]);

  //nastavenie noveho avataru
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);

      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetch();
    } catch (err) {
      console.error("Error uploading avatar:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="container flex-row items-center">
      <div className="relative h-full">
        <label className="cursor-pointer block w-48 h-48">
          {isUploading ? (
            <div className="flex items-center justify-center w-48 h-48 border border-white/15 rounded-full bg-black/20">
              <Loader2Icon className="w-12 h-12 text-tw-primary text-white/60 animate-spin" />
            </div>
          ) : (
            <img src={data.image ? getFromCdn(data.image) : "/anonymous.png"} className="w-48 h-48 border border-white/15 rounded-full object-cover transition-all duration-300 hover:opacity-50 hover:grayscale" alt="avatar" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </label>
      </div>

      <div className="flex flex-col gap-2 text-justify mt-4 w-full">
        <p className="font-semibold text-lg">{data.name}</p>
        <textarea className="text-md text-white/60 w-full border-0 focus:border bg-transparent outline-none resize-none" onChange={(e) => setDescription(e.target.value)} value={description} placeholder="Write something about yourself..." />
      </div>
    </section>
  );
};
