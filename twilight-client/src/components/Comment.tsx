import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { Comment, User } from "../types";
import api from "../axios";
import { getFromCdn } from "../utils";
import { validateComment } from "../validator";
import { DeleteButton } from "./DeleteButton";

type Props = {
  c: Comment;
  postId: string;
  me: User | null;
  refetch: () => Promise<unknown>;
};

export default function Comment({ c, postId, me, refetch }: Props) {
  const canEdit = !!me && (me.id === c.author.id || me.isElder || (c.communityNightOwlsId ?? []).includes(me.id));
  const canDelete = canEdit;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.text);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const start = () => {
    setEditing(true);
    setText(c.text);
    setErr(null);
  };

  const cancel = () => {
    setEditing(false);
    setText(c.text);
    setErr(null);
  };

  const save = async () => {
    const e = validateComment(text);
    if (e) return setErr(e);

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("comment", text.trim());

      await api.put(`/p/${postId}/comments/${c.id}`, fd);

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
      await api.delete(`/p/${postId}/comments/${c.id}`);
      if (editing) setEditing(false);
      await refetch();
    } catch {
      setErr("Failed to delete comment.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="divider-top border-t-tw-border/50 pt-3">
      <div className="flex items-center gap-2">
        <img src={c.author.image ? getFromCdn(c.author.image) : "/anonymous.png"} className="rounded-full w-8 h-8 object-cover" alt="user avatar" />
        <Link to={"/user/" + c.author.id}>{c.author.name}</Link>

        {canEdit ? (
          <button type="button" className="ml-auto text-xs opacity-70 hover:opacity-100" onClick={start} disabled={saving || deleting}>
            Edit
          </button>
        ) : (
          <span className="ml-auto" />
        )}

        <div onClick={(e) => e.stopPropagation()}>
          <DeleteButton isAuthor={canDelete} onConfirm={del} />
        </div>
      </div>

      {!editing ? (
        <p className="text-md text-tw-muted text-justify pb-2 ml-10 break-words">{c.text}</p>
      ) : (
        <div className="ml-10 mt-2">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (err) setErr(null);
            }}
            className="panel border-none dark:text-white/80 placeholder:text-white/40"
            style={{ minHeight: 56 }}
            disabled={saving || deleting}
          />

          {err ? <p className="text-red-500/80 text-sm mt-2">{err}</p> : null}

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="btn px-3" onClick={cancel} disabled={saving || deleting}>
              Cancel
            </button>

            <button type="button" className="btn primary px-3" onClick={save} disabled={saving || deleting || !text.trim()}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
