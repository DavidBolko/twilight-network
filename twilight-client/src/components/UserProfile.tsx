import { useState } from "react";
import type { FullUser, User } from "../types";
import { getFromCdn } from "../utils";

import { Check, Pencil, X, Loader2Icon, UserPlus } from "lucide-react";
import { validateAvatarFile, validateDescription } from "../validator";
import api from "../axios";

interface UserProfileProps {
  data: FullUser;
  id: string;
  refetch: () => void;
  currentUser: User | null;
}

export const UserProfile = ({ data, id, refetch, currentUser }: UserProfileProps) => {
  const isSelf = currentUser?.id === id;

  const [description, setDescription] = useState(data.description || "");
  const [isEditing, setIsEditing] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [descError, setDescError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [friendInfo, setFriendInfo] = useState<string | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelf) return;

    setAvatarError(null);

    const file = e.target.files?.[0];
    if (!file) return;

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

      await api.put(`${import.meta.env.VITE_API_URL}/users/${id}/avatar`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetch();
    } catch {
      setAvatarError("Error uploading avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveDescription = async () => {
    if (!isSelf) return;

    setDescError(null);

    const err = validateDescription(description);
    if (err) {
      setDescError(err);
      return;
    }

    const formData = new FormData();
    formData.append("description", description);

    try {
      setIsSaving(true);

      await api.put(`${import.meta.env.VITE_API_URL}/users/${id}/description`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsEditing(false);
      await refetch();
    } catch {
      setDescError("Failed to update description.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setDescription(data.description || "");
    setDescError(null);
    setIsEditing(false);
  };

  const addFriend = async () => {
    if (isSelf) return;

    setFriendInfo(null);

    try {
      setIsAddingFriend(true);
      await api.post(`${import.meta.env.VITE_API_URL}/f/request/${id}`, null, { withCredentials: true });
      setFriendInfo("Request sent.");
    } catch {
      setFriendInfo("Failed to send request.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  return (
    <section className="container flex-row items-center gap-6">
      <div className="relative">
        <label className={`block w-48 h-48 ${isSelf && isEditing ? "cursor-pointer" : ""}`}>
          {isUploading ? (
            <div className="flex items-center justify-center w-48 h-48 border rounded-full bg-black/20">
              <Loader2Icon className="w-12 h-12 text-white/60 animate-spin" />
            </div>
          ) : (
            <img src={data.image ? getFromCdn(data.image) : "/anonymous.png"} className={`w-48 h-48 border rounded-full object-cover ${avatarError ? "error" : ""} ${isSelf && isEditing ? "hover:opacity-70" : ""}`} alt="avatar" />
          )}

          {/* upload len keď som v edit mode */}
          {isSelf && isEditing ? <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} /> : null}
        </label>

        {avatarError && <p className="text-red-500/80 text-sm mt-2 w-48">{avatarError}</p>}
      </div>

      {/* INFO */}
      <div className="flex flex-col gap-2 w-full min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-lg truncate">{data.name}</p>

          {/* ACTION ICONS */}
          {isSelf ? (
            !isEditing ? (
              <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => setIsEditing(true)} aria-label="Edit profile">
                <Pencil className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50" onClick={saveDescription} disabled={isSaving} aria-label="Save">
                  <Check className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50" onClick={cancelEdit} disabled={isSaving} aria-label="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <button className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50" onClick={addFriend} disabled={isAddingFriend} aria-label="Add friend">
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* DESCRIPTION */}
        <textarea
          className={`w-full bg-transparent outline-none resize-none ${descError ? "error" : ""} ${!isEditing ? "opacity-80" : ""}`}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (descError) setDescError(null);
          }}
          disabled={!isSelf || !isEditing}
          placeholder="Write something about yourself..."
        />

        {descError && <p className="text-red-500/80 text-sm">{descError}</p>}

        {!isSelf && friendInfo && <p className="text-xs opacity-70">{friendInfo}</p>}
      </div>
    </section>
  );
};
