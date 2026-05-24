import React, { useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, Send, XIcon } from "lucide-react";

import type { PostType } from "../types";
import { getFromCdn } from "../utils";
import { api, ApiError } from "../api";

const TEXT_MAX = 2000;
const IMAGES_MAX = 10;

function useImagePreviews(files: File[]) {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  return previews;
}

type Props = {
  postId: string | number;
  initialText?: string | null;
  initialImages?: string[] | null;
  onSaved?: (post: PostType) => void;
  onCancel?: () => void;
};

export default function EditPost({ postId, initialText, initialImages, onSaved, onCancel }: Props) {
  const [text, setText] = useState(initialText ?? "");
  const [existingImages, setExistingImages] = useState<string[]>(initialImages ?? []);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const previews = useImagePreviews(newFiles);

  const imageCount = existingImages.length + newFiles.length;
  const trimmedText = text.trim();
  const canSubmit = !loading && (trimmedText.length > 0 || imageCount > 0) && text.length <= TEXT_MAX && imageCount <= IMAGES_MAX;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    const freeSlots = Math.max(0, IMAGES_MAX - existingImages.length);
    setNewFiles((prev) => [...prev, ...picked].slice(0, freeSlots));
    e.target.value = "";
  };

  const removeExistingImage = (imagePath: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imagePath));
    setRemovedImages((prev) => (prev.includes(imagePath) ? prev : [...prev, imagePath]));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!trimmedText && imageCount === 0) return setErrorMessage("Post cannot be empty.");
    if (trimmedText.length > TEXT_MAX) return setErrorMessage(`Text too long (max ${TEXT_MAX}).`);
    if (imageCount > IMAGES_MAX) return setErrorMessage(`Too many images (max ${IMAGES_MAX}).`);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("text", trimmedText);
      newFiles.forEach((file) => formData.append("images", file));
      removedImages.forEach((img) => formData.append("removeImages", img));

      const updatedPost = await api.put<PostType>(`posts/${postId}`, formData);
      onSaved?.(updatedPost);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message || "Failed to update post." : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel p-0" onSubmit={submit} noValidate>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Edit your post..." className={`w-full bg-transparent border-none outline-none ${text.length > TEXT_MAX ? "outline outline-red-600" : ""}`} style={{ minHeight: 74 }} />

      {(existingImages.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {existingImages.map((imagePath) => (
            <div key={imagePath} className="relative">
              <img src={getFromCdn(imagePath)} className="w-full h-20 object-cover rounded" alt="" />
              <button type="button" className="btn absolute top-1 right-1 p-1" onClick={() => removeExistingImage(imagePath)} disabled={loading} aria-label="Remove image">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {previews.map((url, index) => (
            <div key={url} className="relative">
              <img src={url} className="w-full h-20 object-cover rounded" alt="" />
              <button type="button" className="btn absolute top-1 right-1 p-1" onClick={() => removeNewFile(index)} disabled={loading} aria-label="Remove image">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

      <div className="flex items-center justify-between divider-top pt-2">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />
          <button type="button" className="p-1 rounded hover:text-tw-primary" onClick={() => fileRef.current?.click()} disabled={loading || imageCount >= IMAGES_MAX} aria-label="Add images">
            <ImageIcon size={18} />
          </button>
          <span className="text-xs opacity-70">
            {imageCount}/{IMAGES_MAX} · {text.length}/{TEXT_MAX}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" className="text-sm opacity-70 hover:opacity-100" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={!canSubmit} className={`p-1 rounded ${!canSubmit ? "opacity-50 cursor-not-allowed" : "hover:text-tw-primary"}`} aria-label="Save">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </form>
  );
}
