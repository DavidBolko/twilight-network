import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SendIcon } from "lucide-react";

import Post from "../../components/Post.tsx";
import type { PostType } from "../../types.ts";
import { getFromCdn } from "../../utils.ts";
import { validateComment } from "../../validator.ts";

export const Route = createFileRoute("/post/$id")({
  component: PostPage,
});

async function fetchPost(id: string): Promise<PostType> {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/p/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

function PostPage() {
  const { id } = useParams({ from: Route.id });
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<PostType>({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  const sendComment = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const err = validateComment(comment);
    if (err) {
      setErrorMessage(err);
      return;
    }

    try {
      setIsSending(true);

      const formData = new FormData();
      formData.append("comment", comment);

      await axios.post(`${import.meta.env.VITE_API_URL}/p/${id}/comment`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetch();
      setComment("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = String(err.response?.data ?? "").toLowerCase();

        if (status === 401 || status === 403 || msg.includes("unauthorized")) {
          setErrorMessage("You must be logged in to comment.");
        } else {
          setErrorMessage("Failed to send comment. Please try again.");
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <p className="p-4 text-center">Loading...</p>;
  if (error || !data) return <p className="p-4 text-center text-red-500">Error loading post</p>;

  const commentErr = (errorMessage ?? "").toLowerCase().includes("comment");

  return (
    <div className="container lg:resp-grid">
      <div className="card flex flex-col gap-1 col-start-2">
        <Post id={data.id} title={data.title} text={data.text} author={data.author} communityId={data.communityId} communityName={data.communityName} communityImage={data.communityImage} images={data.images} likes={data.likes} saved={data.saved} />

        <div className="container flex-col mt-4">
          <p className="font-semibold mb-2">Comments</p>

          <form onSubmit={sendComment} noValidate className="flex flex-col gap-2">
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`w-full resize-none h-[80px] outline-none border-b-2 p-2 bg-transparent ${commentErr ? "outline outline-red-600" : "border-stone-700/20"}`}
              placeholder="Write a comment..."
            />

            {errorMessage && <p className="text-red-500/80 text-sm">{errorMessage}</p>}

            <button type="submit" disabled={isSending} className={`btn primary flex items-center self-end gap-1 ${isSending ? "opacity-70 cursor-not-allowed" : ""}`}>
              {isSending ? "Sending..." : "Submit"}
              <SendIcon className="w-4 h-4" />
            </button>
          </form>

          <ul className="container">
            {(data.comments ?? []).map((c) => (
              <li key={c.id}>
                <div className="container flex-col">
                  <div className="flex items-center gap-2">
                    <img src={c.author.image ? getFromCdn(c.author.image) : "/anonymous.png"} className="rounded-full w-8 h-8" alt="user avatar" />
                    <Link to={"/user/" + c.author.id} className="font-medium">
                      {c.author.name}
                    </Link>
                  </div>
                  <p className="text-md text-justify ml-2">{c.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
