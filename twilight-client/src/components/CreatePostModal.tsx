import React, { useState, useCallback, type SyntheticEvent } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, FileTextIcon } from "lucide-react";
import axios from "axios";
import Modal from "./Modal.tsx";
import { useNavigate } from "@tanstack/react-router";

const mediaTypeIcons: React.ReactNode[] = [<ImageIcon />, <FileTextIcon />];
const mediaTypes: string[] = ["images", "text"];

type Props = {
  communityId: string;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
};

export default function CreatePostModal({ communityId, setIsOpen, isOpen }: Props) {
  const navigate = useNavigate();
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) throw new Error("Missing #modal-root in HTML");

  const [mediaType, setMediaType] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop,
    multiple: true,
  });

  const post = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", mediaTypes[mediaType]);
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
        const msg = String(err.response?.data ?? "")
          .trim()
          .toLowerCase();

        if (msg.includes("title")) setErrorMessage("Invalid or missing title.");
        else if (msg.includes("community")) setErrorMessage("Community not found.");
        else if (msg.includes("image")) setErrorMessage("Image upload failed or invalid image format.");
        else if (msg.includes("text")) setErrorMessage("Post text is invalid or too long.");
        else if (msg.includes("type")) setErrorMessage("Invalid post type.");
        else if (msg.includes("empty")) setErrorMessage("Post cannot be empty.");
        else setErrorMessage(err.response?.data || "Failed to create post. Please try again.");
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const commonHeader = (
    <div className="flex justify-between gap-2">
      <input type="text" aria-label="Post Title" onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="flex-grow border p-2 rounded w-2/3" />
      <button type="button" onClick={() => setMediaType((mediaType + 1) % mediaTypeIcons.length)} className="btn" aria-label="Toggle media type">
        {mediaTypeIcons[mediaType]}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <form className="flex flex-col gap-2" onSubmit={post}>
        {commonHeader}

        {mediaType === 0 ? (
          <div {...getRootProps()} className="card border-2 text-sm border-tw-border border-dashed min-h-[300px] center cursor-pointer hover:border-tw-primary">
            <input {...getInputProps()} required />
            {isDragActive ? <p>Drop the images here…</p> : <p>Drag and drop images here, or click to select files</p>}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((file, idx) => (
                  <img key={idx} src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="object-cover h-24 w-full rounded" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <textarea aria-required={true} required aria-label="Post Content" onChange={(e) => setTextContent(e.target.value)} placeholder="Write something..." className="min-h-[300px] border p-2 rounded" />
        )}

        {errorMessage && <p className="text-red-500 text-sm font-medium text-center">{errorMessage}</p>}

        <button type="submit" disabled={isLoading} className={`btn primary self-end ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
          {isLoading ? "Posting..." : "Submit"}
        </button>
      </form>
    </Modal>
  );
}
