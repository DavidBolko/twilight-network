import { useEffect, useState } from "react";
import type { FullUser, User } from "../types";
import { getFromCdn } from "../utils";
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { validateAvatarFile, validateDescription } from "../validator";

interface UserProfileProps {
  data: FullUser;
  id: string;
  refetch: () => void;
  currentUser: User | null;
}

export const UserProfile = ({ data, id, refetch, currentUser }: UserProfileProps) => {
  const [description, setDescription] = useState(data.description || "");
  const [debouncedDescription, setDebouncedDescription] = useState(description);
  const [isUploading, setIsUploading] = useState(false);

  const [descError, setDescError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const isSelf = currentUser?.id === id;
  const isAdmin = !!currentUser?.isElder;
  const showAdminActions = isAdmin && !isSelf && !data.isElder;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDescription(description), 500);
    return () => clearTimeout(handler);
  }, [description]);

  useEffect(() => {
    if (debouncedDescription === (data.description || "")) return;

    const err = validateDescription(debouncedDescription);
    setDescError(err);
    if (err) return;

    const formData = new FormData();
    formData.append("description", debouncedDescription);

    axios
      .put(`${import.meta.env.VITE_API_URL}/users/${id}/description`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .catch(() => {
        setDescError("Failed to update description. Please try again.");
      });
  }, [debouncedDescription, data.description, id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);

    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    const fileErr = validateAvatarFile(file);
    if (fileErr) {
      setAvatarError(fileErr);
      e.target.value = "";
      return;
    }

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
      setAvatarError("Error uploading avatar. Please try again.");
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
            <img src={data.image ? getFromCdn(data.image) : "/anonymous.png"} className={`w-48 h-48 border rounded-full object-cover transition-all duration-300 hover:opacity-50 hover:grayscale ${avatarError ? "error" : "border-white/15"}`} alt="avatar" />
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </label>

        {avatarError && <p className="text-red-500/80 text-sm mt-2 w-48">{avatarError}</p>}
      </div>

      <div className="flex flex-col gap-2 text-justify mt-4 w-full">
        <p className="font-semibold text-lg">{data.name}</p>

        <textarea
          className={`text-md text-white/60 w-full border-0 focus:border bg-transparent outline-none resize-none ${descError ? "error" : ""}`}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descError) setDescError(null);
          }}
          value={description}
          placeholder="Write something about yourself..."
        />

        {descError && <p className="text-red-500/80 text-sm">{descError}</p>}

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
