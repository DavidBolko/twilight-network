import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {  useState, type SyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader, Loader2, Send } from "lucide-react";

import Post from "../../components/Post";
import type { PostType } from "../../types";
import { getFromCdn } from "../../utils";
import { validateComment } from "../../validator";
import api from "../../axios";
import { useUser } from "../../userContext";
import ErrorComponent from "../../components/ErrorComponent";

export const Route = createFileRoute("/post/$id")({
  component: PostPage,
  errorComponent: ErrorComponent
});

async function fetchPost(id: string): Promise<PostType> {
  const res = await api.get(`${import.meta.env.VITE_API_URL}/p/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

function PostPage() {
  const user = useUser();
  const { id } = useParams({ from: Route.id });
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading,  refetch } = useQuery<PostType>({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    retry:false
  });

  const canSend = comment.trim().length > 0 && !isSending;
  const commentErr = (errorMessage ?? "").toLowerCase().includes("comment");

  const sendComment = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const err = validateComment(comment);
    if (err) return setErrorMessage(err);

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("comment", comment.trim());

      await api.post(`${import.meta.env.VITE_API_URL}/p/${id}/comments`, formData, { withCredentials: true });

      setComment("");
      await refetch();
    } catch {
      setErrorMessage("Failed to send comment.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <div className="pt-64"><Loader/></div>;
  if (!data) throw new Error("Post not found");


  return (
    <div className="center-col p-2">
      <div className="panel lg:col-start-2">
        <div className="card">
          <Post {...data} refetch={refetch} />
        </div>

        <section className="box">
          <div className="panel p-0 flex-row items-center ">
            <p className="font-semibold">Comments</p>
            <span className="text-xs text-tw-muted">{(data.comments ?? []).length}</span>
          </div>
          {!user ? <p className="text-xs">You must be <Link to="/auth/login" className="text-tw-primary animate-pulse">logged in</Link> to comment.</p> : ""}
          <form onSubmit={sendComment} className={`${!user ? "blur-sm" : ""}`}>
            <textarea
              disabled={!user}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`panel border-none dark:text-white/80 placeholder:text-white/40 ${commentErr ? "outline outline-red-600 rounded-lg p-2" : ""}`}
              placeholder="Write a comment..."
              style={{ minHeight: 56 }}
            />

            {errorMessage && <p className="text-red-500/80 text-sm mt-2">{errorMessage}</p>}

            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${comment.length > 500 ? "text-red-500" : "text-white/50 "}`}>{comment.length}/500</span>

              <button type="submit" disabled={!canSend} className={`p-1 rounded ${!canSend ? "text-white/30 cursor-not-allowed" : "text-white/60 hover:text-tw-primary"}`} title={isSending ? "Sending..." : "Send"} aria-label="Send comment">
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>

          <ul>
            {data.comments!.map((c) => (
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
