import { type SyntheticEvent } from "react";
import { getFromCdn } from "../utils";
import type { CommunityType } from "../types";
import { Link } from "@tanstack/react-router";
import { api } from "../api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type CommunityCardProps = {
  community: CommunityType;
  currentUserId?: string;
};

export default function CommunityCard({ community, currentUserId }: CommunityCardProps) {
  const queryClient = useQueryClient();
  
  const isMember = community.members.some((m) => m.id === currentUserId);

  const mutation = useMutation({
    mutationFn: () => api.put(`/c/join/${community.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-communities"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar"] });
      queryClient.invalidateQueries({ queryKey: ["user", currentUserId] });
    },
  });

  const handleJoin = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    mutation.mutate();
  };

  return (
    <div className="panel hover:bg-tw-primary/5 flex-row items-center justify-between p-4 gap-4">
      <Link 
        className="flex flex-row items-center gap-4 flex-1 min-w-0" 
        to="/communities/$id" 
        search={{ posts: "hot", time: "month" }} 
        params={{ id: community.id }}
      >
        <img 
          src={getFromCdn(community.image)} 
          alt={community.name} 
          className="w-16 h-16 rounded-full object-cover shrink-0" 
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base truncate">{community.name}</span>
          {community.description && (
            <span className="text-sm text-tw-muted line-clamp-1 italic">
              {community.description}
            </span>
          )}
          <span className="text-xs text-tw-muted/60">{community.membersCount ?? community.members.length} members</span>
        </div>
      </Link>

      {currentUserId && (
        <button 
          className={`btn ${isMember ? "btn-danger" : "btn-primary"}`} 
          onClick={handleJoin}
          disabled={mutation.isPending}
        >
          {isMember ? "Leave" : "Join"}
        </button>
      )}
    </div>
  );
}