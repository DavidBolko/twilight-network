import { useState, type SyntheticEvent } from "react";
import { getFromCdn } from "../utils";
import axios from "axios";
import type { Community } from "../types";
import { Link } from "@tanstack/react-router";

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
    <div className="card flex-row center p-6">
      <Link className="container flex-row " to="/communities/$id" search={{ posts: "hot" }} params={{ id: community.id }}>
        <img src={community.imageUrl ? getFromCdn(community.imageUrl) : "/com" + (Math.floor(Math.random() * 3) + 1) + ".png"} alt={community.name} className="w-20 h-20 rounded-full object-cover" />
        <div>
          <span className="font-semibold text-lg">{community.name}</span>
          {community.description && <span className="text-sm text-white/60 line-clamp-2">{community.description.substring(0, 60)}</span>}
          <span className="text-xs text-white/40">{community.members.length} members</span>
        </div>
      </Link>

      {isMember ? (
        <button className="btn danger" onClick={handleJoin}>
          Leave
        </button>
      ) : (
        <button className="btn primary" onClick={handleJoin}>
          Join
        </button>
      )}
    </div>
  );
}
