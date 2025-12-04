import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import Modal from "./Modal.tsx";
import { api } from "../axios.ts";
import axios from "axios";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function CreateCommunityModal({ isOpen, setIsOpen }: Props) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDesc("");
      setImage(undefined);
      setPreview(null);
      setError("");
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const createCom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("name", title);
      formData.append("description", desc);
      if (image) formData.append("image", image);

      const result = await api.post(`${import.meta.env.VITE_API_URL}/c/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (result.status === 201) {
        setIsOpen(false);
        await navigate({
          to: `/communities/${result.data.id}`,
          params: { id: result.data.id.toString() },
        });
      } else {
        setError(result.statusText || "Unexpected response from server.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = String(err.response?.data ?? "").toLowerCase();

        if (message.includes("exists")) {
          setError("A community with this name already exists.");
        } else if (message.includes("name")) {
          setError("Too short or missing community name.");
        } else if (message.includes("description")) {
          setError("Too short or missing description.");
        } else if (message.includes("image")) {
          setError("Invalid image or upload failed.");
        } else if (message.includes("unauthorized") || message.includes("not authenticated")) {
          setError("You must be logged in to create a community.");
        } else {
          setError("Failed to create community. Please try again.");
        }
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <form onSubmit={createCom} className="container flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Create a Community</h2>

        <span className="container items-center flex-row">
          <label className="cursor-pointer w-16 h-16 flex items-center justify-center border border-white/15 rounded-full bg-black/10 overflow-hidden self-center">
            {isUploading ? (
              <div className="flex items-center justify-center w-full h-full bg-black/20">
                <Loader2Icon className="w-12 h-12 text-tw-primary text-white/60 animate-spin" />
              </div>
            ) : preview ? (
              <img src={preview} alt="community preview" className="object-cover w-full h-full transition-all duration-300 hover:opacity-70 hover:grayscale" />
            ) : (
              <span className="text-white/50 text-xs text-center">Upload image</span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>

          <input type="text" placeholder="Community title" value={title} onChange={(e) => setTitle(e.target.value)} className={`h-fit input ${error.toLowerCase().includes("name") ? "outline outline-red-600" : ""}`} required />
        </span>

        <textarea placeholder="Describe your community..." value={desc} onChange={(e) => setDesc(e.target.value)} className={`input resize-none ${error.toLowerCase().includes("description") ? "outline outline-red-600" : ""}`} />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" className="btn primary w-full disabled:opacity-50" disabled={isUploading}>
            {isUploading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
