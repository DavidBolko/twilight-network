import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shield, ShieldCheck, Pencil, Check, X, Loader2Icon } from "lucide-react";

import type { Community, User } from "../types";
import api from "../axios";
import Modal from "./Modal";
import { getFromCdn } from "../utils";
import { DeleteButton } from "./DeleteButton";
import { validateCommunityClient } from "../validator";

type Props = {
  community: Community;
  me: User | null;
  isMember: boolean;
  refetchCommunity: () => void;
};

/*
 Uprava avatara pomohlo AI
*/

export default function CommunityInfoPanel({ community, me, isMember, refetchCommunity }: Props) {
  const navigate = useNavigate();

  const [openMembers, setOpenMembers] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const owlSet = useMemo(() => new Set(community.communityNightOwlsId ?? []), [community.communityNightOwlsId]);
  const isNightOwl = (userId: string) => owlSet.has(userId);
  const canManage = !!me && (me.isElder || isNightOwl(me.id));

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(community.name ?? "");
  const [desc, setDesc] = useState(community.description ?? "");
  const [img, setImg] = useState<File | undefined>();
  const [err, setErr] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const startEdit = () => {
    if (!canManage) return;
    setName(community.name ?? "");
    setDesc(community.description ?? "");
    setImg(undefined);
    setErr(null);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setErr(null);
    setImg(undefined);
  };

  const saveEdit = async () => {
    if (!canManage) return;

    const v = validateCommunityClient(name, desc, img);
    if (v) return setErr(v);

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("description", desc.trim());
    if (img) fd.append("image", img);

    try {
      setSavingEdit(true);
      await api.put(`/c/${community.id}`, fd);
      setEditing(false);
      await refetchCommunity();
    } catch {
      setErr("Failed to update community.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleJoin = async () => {
    await api.put(`/c/join/${community.id}`);
    await refetchCommunity();
  };

  const handleDelete = async () => {
    const res = await api.delete(`/c/${community.id}`);
    if (res.status === 200) navigate({ to: "/", search: { posts: "hot", time: "week" } });
  };

  const toggleNightOwl = async (targetUserId: string) => {
    if (!canManage) return;
    if (me?.id === targetUserId) return; 

    setSavingUserId(targetUserId);
    try {
      await api.put(`/c/${community.id}/night-owls/${targetUserId}`);
      await refetchCommunity();
    } finally {
      setSavingUserId(null);
    }
  };

  const members = community.members ?? [];
  const nightOwls = members.filter((u) => isNightOwl(u.id));
  const normalMembers = members.filter((u) => !isNightOwl(u.id));
  const orderedMembers = [...nightOwls, ...normalMembers];

  return (
    <div className="card h-fit">
      <div className="panel items-center flex-row">
        <label className={`block w-fit ${canManage && editing ? "cursor-pointer" : ""}`}>
          {savingEdit ? (
            <div className="flex items-center justify-center w-16 h-16 rounded-full border bg-black/20">
              <Loader2Icon className="w-6 h-6 text-white/60 animate-spin" />
            </div>
          ) : (
            <img src={community.imageUrl ? getFromCdn(community.imageUrl) : community.imageUrl} className={`w-20 h-20 rounded-full object-cover ${canManage && editing ? "hover:opacity-70" : ""}`} alt={`${community.name} avatar`} />
          )}

          {canManage && editing ? (
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setImg(f);
                if (err) setErr(null);
              }}
            />
          ) : null}
        </label>

        <div className="panel flex-row justify-between w-fit">
          <div className="w-full">
            {!editing ? (
              <h1 className="text-lg font-semibold truncate">{community.name}</h1>
            ) : (
              <input
                className="panel py-2 w-full max-w-[420px]"
                value={name}
                disabled={savingEdit}
                onChange={(e) => {
                  setName(e.target.value);
                  if (err) setErr(null);
                }}
              />
            )}

            <div className="flex gap-2 items-center mt-2">
              <button onClick={handleJoin} className={`btn ${isMember ? "danger" : "primary"}`} aria-pressed={!!isMember}>
                {isMember ? "Leave" : "Join"}
              </button>

              {canManage ? (
                !editing ? (
                  <button className="p-2 rounded-lg hover:bg-white/5" onClick={startEdit} title="Edit community">
                    <Pencil className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50" onClick={saveEdit} disabled={savingEdit} title="Save">
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-50" onClick={cancelEdit} disabled={savingEdit} title="Cancel">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              ) : null}

              <DeleteButton onConfirm={handleDelete} isAuthor={canManage} />
            </div>

            {err ? <p className="text-red-500/80 text-xs mt-2">{err}</p> : null}
          </div>
        </div>
      </div>

      <div className="panel flex-col divider-top rounded-none">
        <div className="panel flex-row">
          <button className="card hover:bg-tw-muted/10 text-left" onClick={() => setOpenMembers(true)} title="Show members">
            <p className="text-xs text-tw-light-muted dark:text-tw-muted">Members</p>
            <p className="text-lg font-semibold">{community.members?.length ?? 0}</p>
          </button>

          <div className="card">
            <p className="text-xs text-tw-light-muted dark:text-tw-muted">Posts</p>
            <p className="text-lg font-semibold">{community.postCount ?? 0}</p>
          </div>
        </div>

        <div>
          <p className="text-xs mb-1">About</p>
          <textarea
            className={`w-full bg-transparent outline-none resize-none ${!editing ? "opacity-80" : ""}`}
            value={editing ? desc : (community.description ?? "")}
            disabled={!canManage || !editing || savingEdit}
            onChange={(e) => {
              setDesc(e.target.value);
              if (err) setErr(null);
            }}
            style={{ minHeight: 70 }}
          />
        </div>
      </div>

      {openMembers ? (
        <Modal onClose={() => setOpenMembers(false)} background={true} lightbox={false}>
          <div className="p-4 min-h-[400px]">
            <h2 className="text-lg font-semibold">Members</h2>

            <ul className="max-h-[60vh] overflow-auto pr-1">
              {orderedMembers.map((u) => {
                const owl = isNightOwl(u.id);
                const creator = u.id === community.creatorId;
                const isMe = me?.id === u.id;
                const disableToggle = !canManage || isMe || savingUserId === u.id ||creator;

                return (
                  <li key={u.id} className="panel flex-row items-center gap-3">
                    <img src={u.image ? getFromCdn(u.image) : "/anonymous.png"} className="rounded-full w-9 h-9 object-cover" alt="user avatar" />

                    <Link to={"/user/" + u.id} className="font-medium truncate block">
                      {u.name}
                    </Link>

                    <div className="flex items-center gap-2 ml-auto">
                      {owl ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <ShieldCheck size={16} />
                          {creator ? "Creator" : "Night owl"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs opacity-70">
                          <Shield size={16} />
                          Member
                        </span>
                      )}

                      {canManage ? (
                        <button type="button" className={`btn ${owl ? "danger" : "primary"} ${disableToggle  ? "opacity-50" : ""}`} disabled={disableToggle} onClick={() => toggleNightOwl(u.id)} title={owl ? "Remove night owl" : "Make night owl"}>
                          {savingUserId === u.id ? "..." : owl ? "Remove" : "Promote"}
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
