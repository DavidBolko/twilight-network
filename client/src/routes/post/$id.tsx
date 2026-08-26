import { createFileRoute, Link, useParams, useRouterState } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";

import { queryClient } from "../../main.tsx";

import Post from "../../components/Post";
import { createCommentSchema, type CommentType, type PostType } from "../../types";
import { api, ApiError } from "../../api";
import ErrorComponent from "../../components/ErrorComponent";
import Comment from "../../components/Comment";
import Loader from "../../components/Loader";
import { useUser } from "../../hooks.tsx";

const fetchPost = (id: string) => api.get<PostType>(`posts/${id}`);
const fetchComments = (id: string) => api.get<CommentType[]>(`comments/${id}`);

export const Route = createFileRoute("/post/$id")({
  component: PostPage,
  loader: async ({ params: { id } }) => {
    await queryClient.ensureQueryData({
      queryKey: ["post", id],
      queryFn: () => fetchPost(id),
    });
  },
  errorComponent: ErrorComponent,
});

function PostPage() {
  const location = useRouterState({ select: (s) => s.location });
  const user = useUser();
  const queryClient = useQueryClient();
  const { id } = useParams({ from: "/post/$id" });
  
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const postQ = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    retry: false,
  });

  const commentsQ = useQuery({
    queryKey: ["comments", id],
    queryFn: () => fetchComments(id),
    enabled: !!postQ.data,
    retry: false,
  });

  const sendCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.post(`comments`, {
        content: content.trim(),
        postId: id,
      });
    },
    onSuccess: async () => {
      setComment("");
      setErrorMessage(null);
      await queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to send comment.");
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    },
  });

  const isSending = sendCommentMutation.isPending;
  const canSend = !!user && comment.trim().length > 0 && !isSending;

  const hasCommentError = errorMessage?.toLowerCase().includes("comment");

const handleSendComment = (e: SyntheticEvent) => {
  e.preventDefault();
  console.log("user:", user);
  console.log("comment:", comment);
  
  const validation = createCommentSchema.safeParse({
    content: comment,
    postId: id,
  });

  console.log("validation:", validation);
  
  if (!validation.success) {
    setErrorMessage(validation.error.issues[0].message);
    return;
  }

  sendCommentMutation.mutate(comment);
};
  if (postQ.isLoading)
    return (
      <div className="pt-64">
        <Loader />
      </div>
    );
  if (postQ.error || !postQ.data) throw new Error("Post not found");

  const post = postQ.data;
  const comments = commentsQ.data ?? [];
  return (
    <div className="card border-y-0 min-h-screen">
      <div className="border-b border-tw-light-border dark:border-tw-border">
        <Post {...post} refetch={postQ.refetch} />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b border-tw-light-border dark:border-tw-border">
          <p className="font-semibold">Comments</p>
          <span className="text-xs text-tw-light-muted dark:text-tw-muted">{comments.length}</span>
        </div>

        {!user && (
          <p className="text-xs text-tw-light-muted dark:text-tw-muted p-4">
            You must be{" "}
            <Link to="/auth/login" search={{redirect: location.href}} className="text-tw-primary animate-pulse">
              logged in
            </Link>{" "}
            to comment.
          </p>
        )}

        <form onSubmit={handleSendComment} className={`flex flex-col gap-2 p-4 border-b border-tw-light-border dark:border-tw-border transition-opacity ${!user ? "opacity-50 pointer-events-none" : ""}`}>
          <textarea
            disabled={!user || isSending}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className={`min-h-14 border-none bg-transparent dark:text-white/80 placeholder:text-white/40 resize-none focus:ring-0 outline-none ${hasCommentError ? "outline outline-red-600 rounded-lg" : ""}`}
            placeholder={user ? "Write a comment..." : "Login to write a comment"}
          />

          {errorMessage && <p className="text-red-500/80 text-sm">{errorMessage}</p>}

          <div className="flex justify-between items-center">
            <span className={`text-xs ${comment.length > 1000 ? "text-red-500" : "text-tw-light-muted dark:text-tw-muted"}`}>{comment.length}/1000</span>
            <button type="submit" disabled={!canSend} className={`p-1 rounded transition-colors ${!canSend ? "text-tw-light-muted/50 dark:text-white/30 cursor-not-allowed" : "text-tw-light-muted dark:text-white/60 hover:text-tw-primary"}`}>
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>

        {commentsQ.isLoading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : comments.length > 0 ? (
          <ul className="flex flex-col">
            {comments.map((c) => (
              <li key={c.id} className="border-b border-tw-light-border dark:border-tw-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Comment c={c} postId={String(id)} me={user} refetch={commentsQ.refetch} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-tw-light-muted dark:text-tw-muted text-sm p-4">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
