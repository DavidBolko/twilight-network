import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api";
import type { Actor } from "../../types";

export default function FriendRequestNotif({ actor, resourceId }: { actor: Actor | null; resourceId: string | null }) {
  const queryClient = useQueryClient();

  const { data: isFriend } = useQuery<boolean>({
    queryKey: ["isFriend", actor?.id],
    queryFn: () => api.get(`friendship/${actor?.id}`),
    enabled: !!actor,
  });

  if (!actor || !resourceId) return null;

  const accept = async () => {
    await api.patch(`friendship/${resourceId}/accept`);
    queryClient.invalidateQueries({ queryKey: ["isFriend", actor.id] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const decline = async () => {
    await api.patch(`friendship/${resourceId}/decline`);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <div className="card-muted card-interactive flex flex-row items-center gap-3 p-3">
      <img src={actor.avatar ?? "/anonymous.png"} className="avatar size-10" alt="" />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p className="text-xs font-bold">{actor.userName} wants to be your friend.</p>
        {!isFriend ? (
          <div className="flex flex-row gap-1">
            <button className="btn btn-primary" onClick={accept}>Accept</button>
            <button className="btn btn-danger" onClick={decline}>Decline</button>
          </div>
        ) : (
          <p className="text-xs text-tw-muted">You are now friends.</p>
        )}
      </div>
    </div>
  );
}