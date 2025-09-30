import type { SyntheticEvent } from "react";
import { getFromCdn } from "../globals";
import axios from "axios";
import type { Community } from "../types";

type CommunityCardProps = {
  community: Community;
  currentUserId: string;
  isOwnProfile: boolean;
  refetch: () => void;
};

export default function CommunityCard({ community, currentUserId, isOwnProfile, refetch }: CommunityCardProps) {
  const isMember = community.members.some((m) => m.id === currentUserId);

  const handleLeave = async (e: SyntheticEvent) => {
    e.preventDefault();
    await axios.put(`${import.meta.env.VITE_API_URL}/c/leave/${community.id}`, {}, { withCredentials: true });
    refetch();
  };

  const handleJoin = async (e: SyntheticEvent) => {
    e.preventDefault();
    await axios.put(`${import.meta.env.VITE_API_URL}/c/join/${community.id}`, {}, { withCredentials: true });
    refetch();
  };

  return (
    <div className="card justify-between items-center p-6">
      <div className="flex gap-2">
        <img src={getFromCdn(community.imageUrl!) || "/default-community.png"} alt={community.name} className="w-16 h-16 rounded-full object-cover" />
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{community.name}</span>
          {community.description && <span className="text-sm text-white/60 line-clamp-2">{community.description}</span>}
          <span className="text-xs text-white/40">{community.members.length} members</span>
        </div>
      </div>

      {isOwnProfile && (
        <button className="btn primary h-fit" onClick={handleLeave}>
          Leave
        </button>
      )}

      {!isOwnProfile && (
        <>
          {isMember ? (
            <button className="btn border h-fit" onClick={handleLeave}>
              Leave
            </button>
          ) : (
            <button className="btn primary h-fit" onClick={handleJoin}>
              Join
            </button>
          )}
        </>
      )}
    </div>
  );
}
