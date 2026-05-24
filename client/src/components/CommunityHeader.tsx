import { useState } from "react";
import { Users, BookOpen, ShieldCheck, Shield, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { CommunityType, User } from "../types";
import { getFromCdn } from "../utils";
import { api } from "../api";
import Modal from "./Modal";

type Props = {
  community: CommunityType;
  me: User | null;
};

export default function CommunityHeader({ community, me }: Props) {
  const qc = useQueryClient();
  const [showMembers, setShowMembers] = useState(false);

  const isMember = community.members?.some((m) => m.id === me?.id) ?? false;

  const joinMutation = useMutation({
    mutationFn: () => api.put(`communities/${community.id}/join`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community", community.id] });
    },
  });

  const orderedMembers = [...(community.members ?? [])].sort((a, b) => {
    if (a.isCreator) return -1;
    if (b.isCreator) return 1;
    if (a.isNightOwl && !b.isNightOwl) return -1;
    if (!a.isNightOwl && b.isNightOwl) return 1;
    return 0;
  });

  return (
    <div className="flex flex-col w-full">
      <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <img src={community.image ? getFromCdn(community.image) : "/avatar.png"} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-tw-border shadow-2xl" alt={community.name} />

        <div className="flex-1 min-w-0 pt-2">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight truncate">{community.name}</h1>
            {me && community.canManage && (
              <Link to="/communities/$id/settings" params={{ id: community.id }} className="p-2 rounded-full hover:bg-tw-border/50 transition-colors text-tw-muted hover:text-tw-primary" title="Community Settings">
                <Settings size={22} />
              </Link>
            )}
          </div>

          {community.description && <p className="text-tw-muted text-sm leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-none italic">{community.description}</p>}

          <div className="flex items-center gap-3 mt-6">
            <button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending} className={`btn px-8 font-bold transition-all shadow-lg active:scale-95 ${isMember ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" : "btn-primary"}`}>
              {isMember ? "Leave" : "Join"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-tw-border bg-black/5 dark:bg-white/5">
        <button onClick={() => setShowMembers(true)} className="flex items-center justify-center gap-3 py-2 hover:bg-tw-primary/5 transition-colors border-r border-tw-border">
          <div className="flex items-center gap-2 text-tw-muted">
            <Users size={14} />
            <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Members</span>
          </div>
          <span className="text-base font-black">{community.membersCount}</span>
        </button>

        <div className="flex items-center justify-center gap-3 py-2">
          <div className="flex items-center gap-2 text-tw-muted">
            <BookOpen size={14} />
            <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Posts</span>
          </div>
          <span className="text-base font-black">{community.postCount}</span>
        </div>
      </div>

      {showMembers && (
        <Modal onClose={() => setShowMembers(false)} background={true} lightbox={false} title={"Community Members"}>
          <div className="px-6 flex flex-col gap-2">
            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {orderedMembers.map((member) => (
                <Link
                  key={member.id}
                  to="/user/$id"
                  params={{ id: member.id }}
                  search={{
                    tab: "Posts",
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-tw-primary/5 border border-transparent hover:border-tw-primary/10 transition-all"
                  onClick={() => setShowMembers(false)}
                >
                  <div className="flex items-center gap-3">
                    <img src={member.avatar ? getFromCdn(member.avatar) : "/avatar.png"} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{member.username}</span>
                      <span className="text-[10px] text-tw-muted uppercase font-bold tracking-tighter">View Profile</span>
                    </div>
                  </div>

                  {(member.isCreator || member.isNightOwl) && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      {member.isCreator ? <ShieldCheck size={12} /> : <Shield size={12} />}
                      <span className="text-[9px] font-black uppercase">{member.isCreator ? "Creator" : "Night Owl"}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
