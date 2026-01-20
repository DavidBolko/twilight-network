import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, Send, XIcon } from "lucide-react";
import axios from "axios";

import api from "../axios";
import type { PostType } from "../types";
import { getFromCdn } from "../utils";

const TEXT_MAX = 2000;
const IMAGES_MAX = 10;

function useImagePreviews(files: File[]) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  return previews;
}

type Props = {
  postId: string | number;
  initialText?: string;
  initialImageIds?: string[];
  onSaved?: (p: PostType) => void;
  onCancel?: () => void;
};

export default function EditPost({ postId, initialText, initialImageIds, onSaved, onCancel }: Props) {
  const [text, setText] = useState(initialText ?? "");
  const [existing, setExisting] = useState<string[]>(initialImageIds ?? []);
  const [removed, setRemoved] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const previews = useImagePreviews(files);

  useEffect(() => {
    setText(initialText ?? "");
    setExisting(initialImageIds ?? []);
    setRemoved([]);
    setFiles([]);
    setErr(null);
    setLoading(false);
  }, [postId, initialText, initialImageIds]);

  const imageCount = existing.length + files.length;

  const canSubmit = !loading && (text.trim().length > 0 || imageCount > 0) && text.length <= TEXT_MAX;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));

    const space = Math.max(0, IMAGES_MAX - existing.length);
    setFiles((prev) => [...prev, ...picked].slice(0, space));
    e.target.value = "";
  };

  const removeExisting = (id: string) => {
    setExisting((prev) => prev.filter((x) => x !== id));
    setRemoved((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeNew = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const trimmed = text.trim();
    if (!trimmed && imageCount === 0) return setErr("Post cannot be empty.");
    if (trimmed.length > TEXT_MAX) return setErr(`Text too long (max ${TEXT_MAX}).`);
    if (imageCount > IMAGES_MAX) return setErr(`Too many images (max ${IMAGES_MAX}).`);

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("text", text);
      files.forEach((f) => fd.append("images", f));
      removed.forEach((id) => fd.append("removeImageIds", id));

      const res = await api.put(`${import.meta.env.VITE_API_URL}/p/${postId}`, fd, {
        withCredentials: true,
      });

      if (res.status === 200) {
        const updated = res.data as PostType;
        setText(updated.text ?? "");
        setExisting(updated.images ?? []);
        setRemoved([]);
        setFiles([]);
        onSaved?.(updated);
      }
    } catch (e2: unknown) {
      if (axios.isAxiosError(e2)) setErr(String(e2.response?.data ?? e2.message));
      else setErr("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel p-0" onSubmit={submit} noValidate>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Edit your post..." className={`w-full bg-transparent border-none outline-none ${text.length > TEXT_MAX ? "outline outline-red-600" : ""}`} style={{ minHeight: 74 }} />

      {(existing.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {existing.map((id) => (
            <div key={id} className="relative">
              <img src={getFromCdn(id)} className="w-full h-20 object-cover rounded" alt="" />
              <button type="button" className="btn absolute top-1 right-1 p-1" onClick={() => removeExisting(id)} disabled={loading} aria-label="Remove image" title="Remove">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {previews.map((url, idx) => (
            <div key={url} className="relative">
              <img src={url} className="w-full h-20 object-cover rounded" alt="" />
              <button type="button" className="btn absolute top-1 right-1 p-1" onClick={() => removeNew(idx)} disabled={loading} aria-label="Remove image" title="Remove">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {err && <p className="text-red-500 text-sm text-center">{err}</p>}

      <div className="flex items-center justify-between divider-top pt-2">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />

          <button type="button" className="p-1 rounded hover:text-tw-primary" onClick={() => fileRef.current?.click()} disabled={loading} aria-label="Add images" title="Add images">
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

          <button type="submit" disabled={!canSubmit} className={`p-1 rounded ${!canSubmit ? "opacity-50 cursor-not-allowed" : "hover:text-tw-primary"}`} aria-label="Save" title="Save">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </form>
  );
}
