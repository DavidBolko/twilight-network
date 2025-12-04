import React, { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import Modal from "./Modal.tsx";
import { api } from "../axios.ts";
import axios from "axios";
import { validateCommunityClient } from "../validator.ts";

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
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDesc("");
      setImage(undefined);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setError("");
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");

    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const imgErr = validateCommunityClient(title, desc, file);
    if (imgErr && imgErr.toLowerCase().includes("image")) {
      setError(imgErr);
      e.target.value = "";
      return;
    }

    setImage(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const createCom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    const clientErr = validateCommunityClient(title, desc, image);
    if (clientErr) {
      setError(clientErr);
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("name", title.trim());
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
        const status = err.response?.status;
        const message = String(err.response?.data ?? "").toLowerCase();

        if (status === 409 || message.includes("exists")) {
          setError("A community with this name already exists.");
        } else if (status === 401 || status === 403 || message.includes("unauthorized") || message.includes("not authenticated")) {
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

  const errLower = error.toLowerCase();
  const nameOutline = errLower.includes("name") || errLower.includes("title") || errLower.includes("community name");
  const descOutline = errLower.includes("description");
  const imgOutline = errLower.includes("image");

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <form onSubmit={createCom} noValidate className="container flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Create a Community</h2>

        <span className="container items-center flex-row">
          <label className={`cursor-pointer w-16 h-16 flex items-center justify-center border rounded-full bg-black/10 overflow-hidden self-center ${imgOutline ? "outline outline-red-600" : "border-white/15"}`}>
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

          <input type="text" placeholder="Community title" value={title} onChange={(e) => setTitle(e.target.value)} className={`h-fit input ${nameOutline ? "outline outline-red-600" : ""}`} required />
        </span>

        <textarea placeholder="Describe your community..." value={desc} onChange={(e) => setDesc(e.target.value)} className={`input resize-none ${descOutline ? "outline outline-red-600" : ""}`} />

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
