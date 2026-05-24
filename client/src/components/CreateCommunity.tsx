import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../api.ts";
import { createCommunitySchema } from "../types.ts";

type Props = {
  setIsOpen: (open: boolean) => void;
};

export default function CreateCommunity({ setIsOpen }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const categoriesQ = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ id: number; name: string }[]>("categories"),
    staleTime: 5 * 60_000,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const result = createCommunitySchema.shape.image.safeParse(file);
    if (!result.success) {
      setError(result.error.issues[0].message);
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

    const validation = createCommunitySchema.safeParse({ name: title, description: desc, categoryId, image });
    if (!validation.success) { setError(validation.error.issues[0].message); return; }

    try {
      setIsUploading(true);
      const form = new FormData();
      form.append("name", title.trim());
      form.append("description", desc.trim());
      form.append("categoryId", categoryId);
      if (image) form.append("image", image);

      const community = await api.post<{ id: number }>("communities/create", form);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setIsOpen(false);
      navigate({ to: `/communities/${community.id}` });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const errStr = error.toLowerCase();
  const getOutline = (fields: string[]) => fields.some((f) => errStr.includes(f)) ? "form-input-error" : "";

  return (
    <form onSubmit={createCom} noValidate className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Create a Community</h2>

      <div className="flex gap-4 items-center">
        <label className={`cursor-pointer w-20 h-20 flex flex-shrink-0 items-center justify-center border border-tw-light-border dark:border-tw-border rounded-full bg-black/10 overflow-hidden ${getOutline(["image", "file"])}`}>
          {preview ? (
            <img src={preview} className="object-cover w-full h-full" alt="Preview" />
          ) : (
            <span className="text-[10px] text-center opacity-50 px-2">Upload Photo</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>
        <input type="text" placeholder="Community title" value={title} onChange={(e) => setTitle(e.target.value)} className={`input-base flex-1 ${getOutline(["name", "title"])}`} />
      </div>

      <select className={`input-base ${getOutline(["category"])}`} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Select category</option>
        {categoriesQ.data?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <textarea placeholder="Describe your community..." value={desc} onChange={(e) => setDesc(e.target.value)} className={`input-base resize-none h-24 ${getOutline(["description"])}`} />

      {error && <p className="form-error text-center">{error}</p>}

      <button type="submit" className="btn btn-primary w-full" disabled={isUploading}>
        {isUploading ? <Loader2Icon className="animate-spin mx-auto" /> : "Create Community"}
      </button>
    </form>
  );
}