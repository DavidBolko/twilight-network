import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryClient } from "../../main";
import axios from "axios";
import type { FullUser } from "../../types";
import { useQuery } from "@tanstack/react-query";
import Post from "../../components/Post";
import CommunityCard from "../../components/CommunityCard";
import Modal from "../../components/Modal";
import Cropper from "react-easy-crop";
import { getFromCdn } from "../../globals";
import { useUser } from "../../userContext";

const fetchUser = async (id: string) => {
  const res = await axios.get<FullUser>(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const Route = createFileRoute("/user/$id")({
  loader: async ({ params }) => {
    await queryClient.ensureQueryData({
      queryKey: ["user", params.id],
      queryFn: () => fetchUser(params.id),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const user = useUser();
  const [category, setCategory] = useState<"Posts" | "Communities" | "Saved">("Posts");
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const { id } = Route.useParams();
  const { data, refetch } = useQuery<FullUser>({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  const [description, setDescription] = useState(data?.description || "");
  const [debouncedDescription, setDebouncedDescription] = useState(description);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDescription(description);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [description]);

  useEffect(() => {
    if (debouncedDescription !== data?.description) {
      const formData = new FormData();
      formData.append("description", debouncedDescription);
      axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/description`, formData, { withCredentials: true });
    }
  }, [debouncedDescription]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setShowModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const saveCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, zoom);

    if (croppedBlob) {
      const formData = new FormData();
      formData.append("file", croppedBlob, "avatar.jpg");

      const res = await axios.post(`${import.meta.env.VITE_CDN}/upload?bucket=twilight&folder=users`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.status == 200) {
        const key = res.data.key as string;
        const formData = new FormData();

        formData.append("key", key);

        const result = await axios.put(`${import.meta.env.VITE_API_URL}/users/${data?.id}/avatar`, formData, { withCredentials: true });
        if (result.status == 200) {
          refetch();
        }
      }

      setShowModal(false);
      refetch();
    }
  };

  if (!data) return null;

  return (
    <div className="resp-grid">
      <div className="col-start-2 mt-4">
        <section className="container items-center">
          <div className="relative  h-full">
            <label className="cursor-pointer block w-48 h-48">
              <img src={data.image ? getFromCdn(data.image) : "/anonymous.png"} className="w-48 h-48 border border-white/15 rounded-full object-cover hover:opacity-50 hover:grayscale transition-all duration-300" alt="avatar" />
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </label>
          </div>
          <div className="flex flex-col gap-2 text-justify mt-4 w-full">
            <p className="font-semibold text-lg">{data.name}</p>
            <textarea className="text-md text-white/60 w-full border-0 focus:border " onChange={(e) => setDescription(e.target.value)} value={description} />{" "}
          </div>
        </section>

        <section className="container items-center mt-4">
          <div className="flex justify-evenly w-full">
            <button
              onClick={() => {
                setCategory("Posts");
                refetch();
              }}
              className={`btn w-full rounded-r-none ${category === "Posts" ? "primary" : "hover:bg-tw-primary/20"}`}>
              Posts
            </button>
            <button
              onClick={() => {
                setCategory("Communities");
                refetch();
              }}
              className={`btn w-full rounded-none ${category === "Communities" ? "primary" : "hover:bg-tw-primary/20"}`}>
              Communities
            </button>
            <button
              onClick={() => {
                setCategory("Saved");
                refetch();
              }}
              className={`btn w-full rounded-l-none ${category === "Saved" ? "primary" : "hover:bg-tw-primary/20"}`}>
              Saved
            </button>
          </div>
        </section>

        <section className="container items-center mt-4">
          {category === "Posts" && (
            <ul className="flex flex-col gap-4">
              {data.posts.map((post) => (
                <li key={post.id}>
                  <Post key={post.id} {...post} />
                </li>
              ))}
            </ul>
          )}

          {category === "Communities" && (
            <ul className="flex flex-col gap-4 w-full">
              {data.communities.map((com) => (
                <li key={com.id}>
                  <CommunityCard community={com} currentUserId={user?.id!} isOwnProfile={user?.id === data.id} refetch={refetch} />
                </li>
              ))}
            </ul>
          )}

          {category === "Saved" && <p className="text-white/60">No saved posts yet.</p>}
        </section>

        {showModal && imageSrc && (
          <Modal onClose={() => setShowModal(false)}>
            <div className="w-full h-64 relative">
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={saveCroppedImage}>
                Save
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default RouteComponent;

export async function getCroppedImg(imageSrc: string, crop: any, zoom: number) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const { width, height } = image;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, -crop.x * zoom, -crop.y * zoom);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((file) => resolve(file), "image/jpeg");
  });
}

/*

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { queryClient } from "../../main";
import axios from "axios";
import type { FullUser } from "../../types";
import { useQuery } from "@tanstack/react-query";
import Post from "../../components/Post";
import CommunityCard from "../../components/CommunityCard";

const fetchUser = async (id: string) => {
  const res = await axios.get<FullUser>(`/api/users/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const Route = createFileRoute("/user/$id")({
  loader: async ({ params }) => {
    await queryClient.ensureQueryData({
      queryKey: ["user", params.id],
      queryFn: () => fetchUser(params.id),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [category, setCategory] = useState<"Posts" | "Communities" | "Saved">("Posts");

  const { id } = Route.useParams();

  const { data, isLoading, error, refetch } = useQuery<FullUser>({
    queryKey: ["user", id], 
    queryFn: () => fetchUser(id),
  });
  console.log(data);

  if (data) {
    return (
      <div className="resp-grid">
        <div className="col-start-2">
          <section className="container items-center">
            <img src="/anonymous.png" className="w-48 h-48 border border-white/15 rounded-full object-cover" alt="" />
            <div className="flex flex-col gap-2 text-justify">
              <p className="font-semibold text-lg">{data.name}</p>
              <p className="text-md text-white/60">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Hic, consequatur! Adipisci dolores laborum sapiente ut, asperiores assumenda id. Provident consectetur vero tenetur mollitia necessitatibus cum enim doloribus itaque voluptatibus labore?</p>
            </div>
          </section>
          <section className="container items-center">
            <div className="flex justify-evenly w-full">
              <button
                onClick={() => {
                  setCategory("Posts");
                  refetch();
                }}
                className={`btn w-full rounded-r-none  ${category === "Posts" ? "primary" : "hover:bg-tw-primary/20"}`}>
                Posts
              </button>
              <button
                onClick={() => {
                  setCategory("Communities");
                  refetch();
                }}
                className={`btn w-full rounded-none ${category === "Communities" ? "primary" : "hover:bg-tw-primary/20"}`}>
                Communities
              </button>
              <button
                onClick={() => {
                  setCategory("Saved");
                  refetch();
                }}
                className={`btn w-full rounded-l-none ${category === "Saved" ? "primary" : "hover:bg-tw-primary/20"}`}>
                Saved
              </button>
            </div>
          </section>
          <section className="container items-center mt-4">
            {category === "Posts" && (
              <ul className="flex flex-col gap-4">
                {data.posts.map((post) => (
                  <li key={post.id}>
                    <Post key={post.id} {...post} />
                  </li>
                ))}
              </ul>
            )}

            {category === "Communities" && (
              <ul className="flex flex-col gap-4 w-full">
                {data.communities.map((com) => (
                  <li key={com.id}>
                    <CommunityCard key={com.id} {...com} />
                  </li>
                ))}
              </ul>
            )}

            {category === "Saved" && <p className="text-white/60">No saved posts yet.</p>}
          </section>
        </div>
      </div>
    );
  }
}
  */
