import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import Modal from "./Modal.tsx";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function CreateCommunityModal({ isOpen, setIsOpen }: Props) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File>();
  const [error, setError] = useState("");

  const createCom = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!title) {
      setError("Please enter a title");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", title);
      formData.append("description", desc);

      if (image) {
        formData.append("image", image);
      }

      const result = await axios.post(`${import.meta.env.VITE_API_URL}/c/create`, formData, {
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
        setError(result.statusText);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={() => setIsOpen(false)}>
      <form onSubmit={createCom} className="container">
        <h2 className="text-xl font-semibold">Create a Community</h2>

        <input type="text" placeholder="Community title" className={`input ${error.includes("Name") ? "outline outline-red-600" : ""}`} onChange={(e) => setTitle(e.target.value)} required />

        <textarea placeholder="Describe your community..." className="input resize-none" onChange={(e) => setDesc(e.target.value)} />

        <label className="text-sm">Community photo (optional)</label>
        <input type="file" onChange={(e) => setImage(e.target.files?.[0])} />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end">
          <button type="submit" className="btn primary w-full">
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
