import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, Send, XIcon } from "lucide-react";
import axios from "axios";

import api from "../axios";

const TEXT_MAX = 2000;
const IMAGES_MAX = 10;

function useImagePreviews(files: File[]) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  return previews;
}

type Props = {
  communityId: string | number;
  onPosted?: () => void;
};

export default function CreatePost({ communityId, onPosted }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const previews = useImagePreviews(files);

  const imageCount = files.length;
  const canSubmit = !loading && (text.trim().length > 0 || imageCount > 0) && text.length <= TEXT_MAX;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...picked].slice(0, IMAGES_MAX));
    e.target.value = "";
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

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("text", text);
      files.forEach((f) => fd.append("images", f));

      const res = await api.post(`/p/${communityId}`, fd);

      if (res.status === 201 || res.status === 200) {
        setText("");
        setFiles([]);
        onPosted?.();
      }
    } catch (e2: unknown) {
      if (axios.isAxiosError(e2)) setErr(String(e2.response?.data ?? e2.message));
      else setErr("Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What’s happening?" className={`w-full bg-transparent border-none outline-none ${text.length > TEXT_MAX ? "outline outline-red-600" : ""}`} style={{ minHeight: 74 }} />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
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

      <div className="panel flex-row justify-between divider-top">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />

          <button type="button" className="p-1 rounded hover:text-tw-primary" onClick={() => fileRef.current?.click()} disabled={loading} aria-label="Add images" title="Add images">
            <ImageIcon size={18} />
          </button>

          <span className="text-xs opacity-70">
            {imageCount}/{IMAGES_MAX} · {text.length}/{TEXT_MAX}
          </span>
        </div>

        <button type="submit" disabled={!canSubmit} className={`p-1 rounded ${!canSubmit ? "opacity-50 cursor-not-allowed" : "hover:text-tw-primary"}`} aria-label="Post" title="Post">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </form>
  );
}
