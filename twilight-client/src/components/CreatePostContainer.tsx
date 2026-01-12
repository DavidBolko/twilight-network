import React, { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { ImageIcon, Loader2, Send, XIcon } from "lucide-react";

import { validatePostClient } from "../validator.ts";
import { getFromCdn } from "../utils.ts";
import type { PostType } from "../types.ts";
import api from "../axios.ts";
import axios from "axios";

type Props = {
  communityId: string | number;

  // CREATE
  onPosted?: () => void;

  // EDIT
  postId?: string | number;
  initialText?: string;
  initialImageIds?: string[];
  onSaved?: (p: PostType) => void;
  onCancel?: () => void;

  // UI
  variant?: "card" | "inline";
  className?: string;
  refetch?: Function;
};

const TEXT_MAX = 2000;
const IMAGES_MAX = 10;

export default function CreatePostContainer({ communityId, onPosted, postId, initialText, initialImageIds, onSaved, onCancel, variant = "card", className }: Props) {
  const isEdit = postId != null;
  const wrapper = variant === "inline" ? "" : "card";

  const [text, setText] = useState(initialText ?? "");
  const [images, setImages] = useState<File[]>([]); // nové súbory
  const [existing, setExisting] = useState<string[]>(initialImageIds ?? []); // existujúce IDs/URL
  const [removedExisting, setRemovedExisting] = useState<string[]>([]); // čo zmazať

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // keď prepneš na iný post v edit móde
  useEffect(() => {
    setText(initialText ?? "");
    setExisting(initialImageIds ?? []);
    setRemovedExisting([]);
    setImages([]);
    setErrorMessage(null);
    setIsLoading(false);
  }, [postId, initialText, initialImageIds]);

  const textLen = text.length;
  const textOver = textLen > TEXT_MAX;

  const errorId = "create-post-error";
  const countId = "create-post-count";

  const currentImageCount = existing.length + images.length;
  const hasAny = text.trim().length > 0 || currentImageCount > 0;
  const canSubmit = hasAny && !textOver && !isLoading;

  const addImages = useCallback(
    (files: File[]) => {
      const onlyImages = files.filter((f) => f.type.startsWith("image/"));
      if (!onlyImages.length) return;

      setImages((prev) => {
        const limit = Math.max(0, IMAGES_MAX - existing.length);
        const merged = [...prev, ...onlyImages];
        return merged.slice(0, limit);
      });
    },
    [existing.length],
  );

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

  const removeNewImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const removeExisting = (imgId: string) => {
    setExisting((prev) => prev.filter((x) => x !== imgId));
    setRemovedExisting((prev) => (prev.includes(imgId) ? prev : [...prev, imgId]));
  };

  const resetCreate = () => {
    setText("");
    setImages([]);
    setExisting([]);
    setRemovedExisting([]);
    setErrorMessage(null);
    setIsLoading(false);
  };

  const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    // CREATE: tvoja existujúca validácia (text+new images)
    if (!isEdit) {
      const clientErr = validatePostClient(text, images);
      if (clientErr) return setErrorMessage(clientErr);
    } else {
      // EDIT: berieme do úvahy aj existing obrázky
      const trimmed = text.trim();
      if (!trimmed && existing.length === 0 && images.length === 0) return setErrorMessage("Post cannot be empty.");
      if (trimmed.length > TEXT_MAX) return setErrorMessage(`Post text is too long. Max ${TEXT_MAX} characters.`);
      if (existing.length + images.length > IMAGES_MAX) return setErrorMessage(`You can upload a maximum of ${IMAGES_MAX} images.`);
    }

    try {
      setIsLoading(true);

      const fd = new FormData();
      fd.append("text", text ?? "");
      images.forEach((img) => fd.append("images", img));
      removedExisting.forEach((id) => fd.append("removeImageIds", id));

      const url = isEdit ? `${import.meta.env.VITE_API_URL}/p/${postId}` : `${import.meta.env.VITE_API_URL}/p/${communityId}`;

      const res = isEdit ? await api.put(url, fd, { withCredentials: true }) : await api.post(url, fd, { withCredentials: true });

      if (res.status === 200 || res.status === 201) {
        if (isEdit) {
          const updated = res.data as PostType;

          // refresh UI v tomto komponente
          setText(updated.text ?? "");
          setExisting(updated.images ?? []);
          setImages([]);
          setRemovedExisting([]);

          onSaved?.(updated);
        } else {
          resetCreate();
          onPosted?.();
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401 || status === 403) setErrorMessage("You must be logged in.");
        else setErrorMessage(String(err.response?.data ?? err.message));
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={`${wrapper} ${className ?? ""}`.trim()} onSubmit={submit} onDragOver={onDragOver} onDrop={onDrop} onClick={(e) => e.stopPropagation()} noValidate>
      <label htmlFor={isEdit ? "editPost" : "createPost"} className="sr-only">
        Post content
      </label>

      <textarea id={isEdit ? "editPost" : "createPost"} value={text} onChange={(e) => setText(e.target.value)} onPaste={onPaste} placeholder={isEdit ? "Edit your post..." : "What’s happening?"} className={`w-full bg-transparent border-none ${textOver ? "outline outline-red-600" : ""}`} style={{ minHeight: 74 }} />

      {/* EXISTING IMAGES (edit) */}
      {existing.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {existing.map((id, idx) => (
            <div key={id} className="relative">
              <img src={getFromCdn(id)} alt={`Existing image ${idx + 1}`} className="object-cover h-20 w-full rounded" />
              <button type="button" onClick={() => removeExisting(id)} className="btn absolute top-1 right-1 p-1" aria-label="Remove image" title="Remove" disabled={isLoading}>
                <XIcon aria-hidden="true" focusable="false" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NEW IMAGES */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, idx) => (
            <div key={url} className="relative">
              <img src={url} alt={`Selected image ${idx + 1}`} className="object-cover h-20 w-full rounded" />
              <button type="button" onClick={() => removeNewImage(idx)} className="btn absolute top-1 right-1 p-1" aria-label="Remove image" title="Remove" disabled={isLoading}>
                <XIcon aria-hidden="true" focusable="false" />
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
          <input id={isEdit ? "edit-post-images" : "create-post-images"} ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />

          <label
            htmlFor={isEdit ? "edit-post-images" : "create-post-images"}
            aria-label="Add images"
            title="Add images"
            className={`p-1 rounded cursor-pointer transition-colors ${isLoading ? "text-white/40 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`}
            onClick={(e) => {
              if (isLoading) e.preventDefault();
            }}>
            <ImageIcon size={18} aria-hidden="true" focusable="false" />
          </label>

          <span className="text-xs text-white/50">
            {currentImageCount}/{IMAGES_MAX}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span id={countId} className={`text-xs ${textOver ? "text-red-400" : "text-white/50"}`} aria-live="polite">
            {textLen}/{TEXT_MAX}
          </span>

          <button type="submit" disabled={!canSubmit} aria-label={isLoading ? (isEdit ? "Saving" : "Posting") : isEdit ? "Save" : "Post"} title={isLoading ? (isEdit ? "Saving..." : "Posting...") : canSubmit ? (isEdit ? "Save" : "Post") : "Write text or add an image"} className={`p-1 rounded transition-colors ${!canSubmit ? "text-white/30 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`}>
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </form>
  );
}
