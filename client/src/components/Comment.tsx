import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { api } from "../api";
import { getFromCdn } from "../utils";
import { DeleteButton } from "./DeleteButton";
import { createCommentSchema, type CommentType, type User } from "../types";

type Props = {
  c: CommentType;
  postId: string;
  me: User | null;
  refetch: () => Promise<unknown>;
};

export default function Comment({ c, postId, me, refetch }: Props) {
  const canEdit = !!me && (me.id === c.author.id || me.isElderOwl);
  const canDelete = canEdit;

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(c.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = () => {
    setEditing(true);
    setContent(c.content);
    setErr(null);
  };
  const cancel = () => {
    setEditing(false);
    setContent(c.content);
    setErr(null);
  };

  const save = async () => {
    const validation = createCommentSchema.safeParse({ content: content.trim(), postId });
    if (!validation.success) {
      setErr(validation.error.issues[0].message);
      return;
    }

    setSaving(true);
    setErr(null);
    try {
      await api.put(`comments/${c.id}`, { content: content.trim(), postId });
      setEditing(false);
      await refetch();
    } catch {
      setErr("Failed to edit comment.");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setErr(null);
    try {
      await api.delete(`comments/${c.id}`);
      if (editing) setEditing(false);
      await refetch();
    } catch {
      setErr("Failed to delete comment.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <img src={c.author.avatar ? getFromCdn(c.author.avatar) : "/anonymous.png"} className="rounded-full w-8 h-8 object-cover" alt="user avatar" />
        <Link to={"/user/" + c.author.id} className="font-medium hover:text-tw-primary transition-colors text-sm">
          {c.author.username}
        </Link>
        {canEdit && !editing && (
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100 transition-opacity text-tw-primary" onClick={start} disabled={saving || deleting}>
            Edit
          </button>
        )}
        <div className={!canEdit || editing ? "ml-auto" : ""} onClick={(e) => e.stopPropagation()}>
          <DeleteButton isAuthor={canDelete} onConfirm={del} />
        </div>
      </div>

      {!editing ? (
        <p className="text-sm text-tw-light-muted dark:text-tw-muted mt-2 ml-10 break-words">{c.content}</p>
      ) : (
        <div className="ml-10 mt-2 flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (err) setErr(null);
            }}
            className={`input-base min-h-[160px] max-h-[400px] overflow-y-auto ${err ? "form-input-error" : ""}`}
            disabled={saving || deleting}
            placeholder="Edit your comment..."
          />
          {err && <p className="form-error">{err}</p>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn" onClick={cancel} disabled={saving || deleting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary flex items-center gap-1" onClick={save} disabled={saving || deleting || !content.trim()}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
