import React, { useState, useCallback, type SyntheticEvent, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, FileTextIcon } from "lucide-react";
import axios from "axios";
import Modal from "./Modal.tsx";
import { useNavigate } from "@tanstack/react-router";
import { validatePostClient } from "../validator.ts";

const mediaTypeIcons: React.ReactNode[] = [<ImageIcon />, <FileTextIcon />];

const serverTypes = ["IMAGE", "TEXT"] as const;

type Props = {
  communityId: string;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
};

export default function CreatePostModal({ communityId, setIsOpen, isOpen }: Props) {
  const navigate = useNavigate();

  const [mediaType, setMediaType] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const errLower = (errorMessage ?? "").toLowerCase();
  const titleErr = errLower.includes("title");
  const textErr = errLower.includes("text") || errLower.includes("empty") || errLower.includes("html");
  const imageErr = errLower.includes("image");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => {
      const merged = [...prev, ...acceptedFiles];
      return merged.slice(0, 10);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
    multiple: true,
  });

  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    if (!isOpen) {
      setMediaType(0);
      setImages([]);
      setTitle("");
      setTextContent("");
      setErrorMessage(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const post = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const type = serverTypes[mediaType];

    const clientErr = validatePostClient(title, type, textContent, images);
    if (clientErr) {
      setErrorMessage(clientErr);
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("type", type);
      formData.append("text", textContent);

      images.forEach((file) => formData.append("images", file));

      const result = await axios.post(`${import.meta.env.VITE_API_URL}/p/${communityId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (result.status === 200) {
        await navigate({ to: `/post/${result.data.id}` });
        setIsOpen(false);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = String(err.response?.data ?? "")
          .trim()
          .toLowerCase();
        if (status === 404 || msg.includes("community")) setErrorMessage("Community not found.");
        else if (status === 401 || status === 403 || msg.includes("unauthorized")) setErrorMessage("You must be logged in to post.");
        else setErrorMessage("Failed to create post. Please try again.");
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const commonHeader = (
    <div className="flex justify-between gap-2">
      <input type="text" aria-label="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className={`flex-grow border p-2 rounded w-2/3 ${titleErr ? "outline outline-red-600" : ""}`} />
      <button
        type="button"
        onClick={() => {
          setMediaType((m) => (m + 1) % mediaTypeIcons.length);
          setErrorMessage(null);
        }}
        className="btn"
        aria-label="Toggle media type">
        {mediaTypeIcons[mediaType]}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <form className="flex flex-col gap-2" onSubmit={post} noValidate>
        {commonHeader}

        {mediaType === 0 ? (
          <div {...getRootProps()} className={`card border-2 text-sm border-dashed min-h-[300px] center cursor-pointer hover:border-tw-primary ${imageErr ? "outline outline-red-600" : "border-tw-border"}`}>
            <input {...getInputProps()} />
            {isDragActive ? <p>Drop the images here…</p> : <p>Drag and drop images here, or click to select files</p>}

            {images.length > 0 && (
              <>
                <p className="mt-2 text-white/60 text-xs">{images.length}/10 images</p>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previews.map((url, idx) => (
                    <img key={url} src={url} alt={`preview-${idx}`} className="object-cover h-24 w-full rounded" />
                  ))}
                </div>

                <button type="button" className="btn mt-2" onClick={() => setImages([])}>
                  Clear images
                </button>
              </>
            )}
          </div>
        ) : (
          <textarea aria-required={true} aria-label="Post Content" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Write something..." className={`min-h-[300px] border p-2 rounded ${textErr ? "outline outline-red-600" : ""}`} />
        )}

        {errorMessage && <p className="text-red-500 text-sm font-medium text-center">{errorMessage}</p>}

        <button type="submit" disabled={isLoading} className={`btn primary self-end ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
          {isLoading ? "Posting..." : "Submit"}
        </button>
      </form>
    </Modal>
  );
}
