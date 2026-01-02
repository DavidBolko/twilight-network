import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Send } from "lucide-react";

import Post from "../../components/Post";
import type { PostType } from "../../types";
import { getFromCdn } from "../../utils";
import { validateComment } from "../../validator";

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

  const canSend = comment.trim().length > 0 && !isSending;
  const commentErr = (errorMessage ?? "").toLowerCase().includes("comment");

  const sendComment = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const err = validateComment(comment);
    if (err) return setErrorMessage(err);

    try {
      setIsSending(true);

      const formData = new FormData();
      formData.append("comment", comment.trim());

      await axios.post(`${import.meta.env.VITE_API_URL}/p/${id}/comment`, formData, {
        withCredentials: true,
      });

      setComment("");
      await refetch();
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

  return (
    <div className="resp-grid p-2">
      <div className="container lg:col-start-2">
        {/* Post */}
        <div className="card">
          <Post id={data.id} text={data.text} author={data.author} communityId={data.communityId} communityName={data.communityName} communityImage={data.communityImage} images={data.images} likes={data.likes} saved={data.saved} comments={data.comments} />
        </div>

        {/* Komentovacia sekcia */}
        <section className="box">
          <div className="container p-0 flex-row justify-between items-center mb-2">
            <p className="font-semibold">Comments</p>
            <span className="text-xs text-tw-muted">{(data.comments ?? []).length}</span>
          </div>

          <form onSubmit={sendComment} noValidate>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`container border-none dark:text-white/80 placeholder:text-white/40 ${commentErr ? "outline outline-red-600 rounded-lg p-2" : ""}`}
              placeholder="Write a comment..."
              style={{ minHeight: 56 }}
            />

            {errorMessage && <p className="text-red-500/80 text-sm mt-2">{errorMessage}</p>}

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-white/50">{comment.length}/2000</span>

              <button type="submit" disabled={!canSend} className={`p-1 rounded transition-colors ${!canSend ? "text-white/30 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`} title={isSending ? "Sending..." : "Send"} aria-label="Send comment">
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>

          <ul>
            {(data.comments ?? []).map((c) => (
              <li key={c.id} className="divider-top border-t-tw-border/50 pt-3">
                <div className="flex items-center gap-2">
                  <img src={c.author.image ? getFromCdn(c.author.image) : "/anonymous.png"} className="rounded-full w-8 h-8 object-cover" alt="user avatar" />
                  <Link to={"/user/" + c.author.id}>{c.author.name}</Link>
                </div>
                <p className="text-md text-tw-muted text-justify pb-2 ml-10 break-words">{c.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PostPage;
