import React, { useEffect, useMemo, useRef } from "react";
import { ImageIcon, Loader2, SendIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api, ApiError } from "../api";
import { createPostSchema, type CreatePostInput } from "../types";

const IMAGES_MAX = 10;

type Props = {
  communityId?: string | number;
  onPosted?: () => void;
};

function useImagePreviews(files: File[] = []) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  return previews;
}

export default function CreatePost({ communityId, onPosted }: Props) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { isSubmitting, errors, isValid },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", text: "", images: [] },
    mode: "onChange",
  });

  const files = watch("images") ?? [];
  const previews = useImagePreviews(files);

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const selectedFiles = data.images ?? [];

      const fd = new FormData();

      if (data.title?.trim()) {
        fd.append("title", data.title.trim());
      }

      if (data.text?.trim()) {
        fd.append("text", data.text.trim());
      }

      fd.append("type", selectedFiles.length > 0 ? "Image" : "Text");

      if (communityId) {
        fd.append("communityId", String(communityId));
      }

      selectedFiles.forEach((file) => {
        fd.append("images", file);
      });

      return api.post("posts", fd);
    },

    onSuccess: async () => {
      reset();
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["posts"] }), queryClient.invalidateQueries({ queryKey: ["community-posts"] })]);
      onPosted?.();
    },

    onError: (err) => {
      if (err instanceof ApiError) {
        setError("root", {
          message: err.message || "Failed to create post.",
        });

        return;
      }

      setError("root", {
        message: "Failed to create post.",
      });
    },
  });

  const isPosting = isSubmitting || createPostMutation.isPending;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));

    setValue("images", [...files, ...picked].slice(0, IMAGES_MAX), {
      shouldValidate: true,
    });

    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setValue(
      "images",
      files.filter((_, i) => i !== idx),
      { shouldValidate: true },
    );
  };

  const submit = handleSubmit(async (data) => {
    await createPostMutation.mutateAsync(data);
  });

return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <input 
            {...register("title")} 
            type="text" 
            placeholder="Title (optional)" 
            className="w-full bg-transparent border-none outline-none text-xl font-bold placeholder:opacity-30 p-0 focus:ring-0" 
          />

          <textarea 
            {...register("text")} 
            placeholder="What's happening?" 
            className="w-full bg-transparent border-none outline-none text-lg resize-none placeholder:opacity-30 p-0 focus:ring-0 min-h-[80px]" 
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 rounded-xl overflow-hidden">
              {previews.map((url, idx) => (
                <div key={url} className="relative group aspect-video border border-tw-border/50 rounded-lg overflow-hidden">
                  <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                  <button 
                    type="button" 
                    className="btn-danger absolute top-2 right-2 !p-1.5 !rounded-full bg-black/50 backdrop-blur-sm shadow-xl" 
                    onClick={() => removeFile(idx)} 
                    disabled={isPosting}
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <hr className="border-tw-light-border dark:border-tw-border opacity-50" />

      {(errors.title || errors.text || errors.root) && (
        <div className="form-error text-center bg-red-500/10 py-2 rounded-md">
          {errors.title?.message || errors.text?.message || errors.root?.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={pickFiles} />

          <button 
            type="button" 
            className="btn-muted !p-2 group" 
            onClick={() => fileRef.current?.click()} 
            disabled={isPosting} 
            title="Add images"
          >
            <ImageIcon size={20} className="transition-all group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(var(--tw-color-primary-rgb),0.8)]" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
            Images: {files.length}/{IMAGES_MAX}
          </span>
        </div>

        <button 
          type="submit" 
          disabled={!isValid || isPosting} 
          className="link px-2 py-2 text-xs uppercase tracking-widest font-bold"
        >
          {isPosting ? <Loader2 size={18} className="animate-spin" /> : <SendIcon width={18}/>}
        </button>
      </div>
    </form>
  );
}
