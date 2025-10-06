import { useState, type SyntheticEvent } from "react";
import { getFromCdn } from "../utils";
import axios from "axios";
import type { Community } from "../types";

type CommunityCardProps = {
  community: Community;
  currentUserId: string;
  isOwnProfile: boolean;
  refetch: () => void;
};

export default function CommunityCard({ community, currentUserId, refetch }: CommunityCardProps) {
  const [isMember, setIsMember] = useState(community.members.some((m) => m.id === currentUserId));

  const handleJoin = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/c/join/${community.id}`, {}, { withCredentials: true });

      setIsMember((prev) => !prev);
      refetch();
    } catch (err) {
      console.error("Failed to toggle membership", err);
    }
  };

  return (
    <div className="card justify-between items-center p-6">
      <div className="flex gap-2">
        <img src={community.imageUrl ? getFromCdn(community.imageUrl) : "/default-community.png"} alt={community.name} className="w-16 h-16 rounded-full object-cover" />
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{community.name}</span>
          {community.description && <span className="text-sm text-white/60 line-clamp-2">{community.description}</span>}
          <span className="text-xs text-white/40">{community.members.length} members</span>
        </div>
      </div>

      {isMember ? (
        <button className="btn border hover:primary h-fit" onClick={handleJoin}>
          Leave
        </button>
      ) : (
        <button className="btn primary h-fit" onClick={handleJoin}>
          Join
        </button>
      )}
    </div>
  );
}
