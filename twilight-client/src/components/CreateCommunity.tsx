import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../axios.ts";
import axios from "axios";
import { validateCommunityClient } from "../validator.ts";

type Props = {
  setIsOpen: (open: boolean) => void;
};

type Category = { id: number; name: string };

async function fetchCategories(): Promise<Category[]> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/categories`, { withCredentials: true });
  return res.data;
}

export default function CreateCommunity({ setIsOpen }: Props) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState<string>(""); // select value (string)

  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const reset = () => {
    setTitle("");
    setDesc("");
    setImage(undefined);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError("");
    setIsUploading(false);
    setCategoryId("");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const imgErr = validateCommunityClient(title, desc, file);
    if (imgErr?.toLowerCase().includes("image")) {
      setError(imgErr);
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const createCom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const clientErr = validateCommunityClient(title, desc, image);
    if (clientErr) return setError(clientErr);

    if (!categoryId) return setError("Please select a category.");

    try {
      setIsUploading(true);

      const form = new FormData();
      form.append("name", title.trim());
      form.append("description", desc.trim());
      form.append("categoryId", categoryId); // 👈 posielame vybranú kategóriu
      if (image) form.append("image", image);

      const res = await api.post(`${import.meta.env.VITE_API_URL}/c/create`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsOpen(false);
      await navigate({ to: `/communities/${res.data.id}`, params: { id: String(res.data.id) } });
      reset();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) return setError("A community with this name already exists.");
        if (status === 401 || status === 403) return setError("You must be logged in.");
        // ak backend vráti text chyby
        const msg = typeof err.response?.data === "string" ? err.response.data : "";
        if (msg) return setError(msg);
      }
      setError("Failed to create community.");
    } finally {
      setIsUploading(false);
    }
  };

  const err = error.toLowerCase();
  const nameOutline = err.includes("name") || err.includes("title") || err.includes("community");
  const descOutline = err.includes("description");
  const imgOutline = err.includes("image");
  const catOutline = err.includes("category");

  return (
    <form onSubmit={createCom} noValidate className="panel flex-col gap-4">
      <h2 className="text-xl font-semibold">Create a Community</h2>

      <span className="panel items-center flex-row">
        <label className={`cursor-pointer w-16 h-16 flex items-center justify-center border rounded-full bg-black/10 overflow-hidden self-center ${imgOutline ? "outline outline-red-600" : "border-white/15"}`}>
          {isUploading ? (
            <div className="flex items-center justify-center w-full h-full bg-black/20">
              <Loader2Icon className="w-12 h-12 text-tw-primary text-white/60 animate-spin" />
            </div>
          ) : preview ? (
            <img src={preview} alt="" className="object-cover w-full h-full transition-all duration-300 hover:opacity-70 hover:grayscale" />
          ) : (
            <span className="text-white/50 text-xs text-center">Upload image</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>

        <input type="text" placeholder="Community title" value={title} onChange={(e) => setTitle(e.target.value)} className={`h-fit input ${nameOutline ? "outline outline-red-600" : ""}`} required />
      </span>

      <select className={`input ${catOutline ? "outline outline-red-600" : ""}`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={categoriesQ.isLoading || !categoriesQ.data?.length}>
        <option value="">{categoriesQ.isLoading ? "Loading categories..." : "Select category"}</option>

        {categoriesQ.data?.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea placeholder="Describe your community..." value={desc} onChange={(e) => setDesc(e.target.value)} className={`input resize-none ${descOutline ? "outline outline-red-600" : ""}`} />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button type="submit" className="btn primary w-full disabled:opacity-50" disabled={isUploading}>
        {isUploading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
