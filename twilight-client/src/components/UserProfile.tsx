import { useEffect, useState } from "react";
import type { FullUser, User } from "../types";
import { getFromCdn } from "../utils";
import axios from "axios";
import { Loader2Icon } from "lucide-react";

interface UserProfileProps {
  data: FullUser;
  id: string; // ID profilu, ktorý si pozerám
  refetch: () => void;
  currentUser: User | null; // prihlásený user, môže byť aj null
}

export const UserProfile = ({ data, id, refetch, currentUser }: UserProfileProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [debouncedDescription, setDebouncedDescription] = useState(description);
  const [isUploading, setIsUploading] = useState(false);

  // môže byť undefined, ak user nie je prihlásený
  const isSelf = currentUser?.id === id;
  const isAdmin = !!currentUser?.isElder; // alebo iný field, ktorý máš v FullUser
  const showAdminActions = isAdmin && !isSelf && !data.isElder;

  // Debounce zmeny popisu (odošleme až keď sa prestane písať)
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
  }, [debouncedDescription, data.description, id]);

  // nastavenie noveho avataru
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

  const handleBan = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/ban`, {}, { withCredentials: true });
      await refetch();
    } catch (err) {
      console.error("Error banning user:", err);
    }
  };

  const handlePromote = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${id}/promote`, {}, { withCredentials: true });
      await refetch();
    } catch (err) {
      console.error("Error promoting user:", err);
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

        {showAdminActions && (
          <div className="flex gap-2 mt-4">
            <button className="btn danger" onClick={handleBan}>
              Ban
            </button>
            <button className="btn primary" onClick={handlePromote}>
              Promote
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
