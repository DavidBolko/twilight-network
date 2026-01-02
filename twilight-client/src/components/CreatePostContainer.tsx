import React, { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { ImageIcon, Loader2, Send, XIcon } from "lucide-react";
import axios from "axios";
import { validatePostClient } from "../validator.ts";

type Props = {
  communityId: string | number;
  onPosted?: () => void;
};

const TEXT_MAX = 2000;
const IMAGES_MAX = 10;

export default function CreatePostContainer({ communityId, onPosted }: Props) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const textLen = text.length;
  const textOver = textLen > TEXT_MAX;

  const errorId = "create-post-error";
  const countId = "create-post-count";

  const hasAny = text.trim().length > 0 || images.length > 0;
  const canSubmit = hasAny && !textOver && !isLoading;

  const addImages = useCallback((files: File[]) => {
    const onlyImages = files.filter((f) => f.type.startsWith("image/"));
    if (!onlyImages.length) return;

    setImages((prev) => {
      const merged = [...prev, ...onlyImages];
      return merged.slice(0, IMAGES_MAX);
    });
  }, []);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    addImages(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addImages(Array.from(e.dataTransfer.files ?? []));
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items ?? []);
    const files: File[] = [];
    for (const it of items) {
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
    }
    if (files.length) addImages(files);
  };

  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setText("");
    setImages([]);
    setErrorMessage(null);
    setIsLoading(false);
  };

  const post = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clientErr = validatePostClient(text, images);
    if (clientErr) return setErrorMessage(clientErr);

    try {
      setIsLoading(true);

      const fd = new FormData();
      fd.append("text", text ?? "");
      images.forEach((img) => fd.append("images", img));

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/p/${communityId}`, fd, { withCredentials: true });

      if (res.status === 201 || res.status === 200) {
        reset();
        onPosted?.();
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) setErrorMessage("You must be logged in to post.");
        else setErrorMessage(String(err.response?.data ?? err.message));
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={post} onDragOver={onDragOver} onDrop={onDrop} noValidate>
      <label htmlFor="createPost" className="sr-only">
        Post content
      </label>
      <textarea id="createPost" value={text} onChange={(e) => setText(e.target.value)} onPaste={onPaste} placeholder="What’s happening?" className={`w-full bg-transparent border-none ${textOver ? "outline outline-red-600" : ""}`} style={{ minHeight: 74 }} />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, idx) => (
            <div key={url} className="relative">
              <img src={url} alt={`Selected image ${idx + 1}`} className="object-cover h-20 w-full rounded" />
              <button type="button" onClick={() => removeImage(idx)} className="btn absolute top-1 right-1 p-1" aria-label="Remove image" title="Remove">
                <XIcon aria-hidden="true" focusable="false" />{" "}
              </button>
            </div>
          ))}
        </div>
      )}

      {errorMessage && (
        <p id={errorId} role="alert" aria-live="polite" className="text-red-500 text-sm font-medium text-center">
          {errorMessage}
        </p>
      )}

      <div className="container rounded-none flex-row justify-between divider-top">
        <div className="flex items-center gap-2">
          <input id="create-post-images" ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />

          <label
            htmlFor="create-post-images"
            aria-label="Add images"
            title="Add images"
            className={`p-1 rounded cursor-pointer transition-colors ${isLoading ? "text-white/40 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`}
            onClick={(e) => {
              if (isLoading) e.preventDefault();
            }}>
            <ImageIcon size={18} aria-hidden="true" focusable="false" />
          </label>

          {images.length > 0 && (
            <span className="text-xs text-white/50">
              {images.length}/{IMAGES_MAX}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span id={countId} className={`text-xs ${textOver ? "text-red-400" : "text-white/50"}`} aria-live="polite">
            {textLen}/{TEXT_MAX}
          </span>

          <button type="submit" disabled={!canSubmit} aria-label={isLoading ? "Posting" : "Post"} title={isLoading ? "Posting..." : canSubmit ? "Post" : "Write text or add an image"} className={`p-1 rounded transition-colors ${!canSubmit ? "text-white/30 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </form>
  );
}
