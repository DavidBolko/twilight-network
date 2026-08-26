import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "../../api";
import { notificationSchema, type Notification } from "../../types";
import FriendRequestNotif from "../../components/Notifications/FriendRequestNotif";
import { Empty } from "../../components/Errors/Empty";

export const Route = createFileRoute("/_main/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await api.get<Notification[]>("notifications");
      return data.map((n) => notificationSchema.parse(n));
    },
  });

  const markedRef = useRef(false);

  useEffect(() => {
    if (!markedRef.current && notifications.some((n) => !n.isRead)) {
      markedRef.current = true;
      api.patch("notifications/read-all");
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => old.map((n) => ({ ...n, isRead: true })));
    }
  }, [notifications, queryClient]);

  return (
    <div className="card min-h-screen border-y-0 rounded-none p-4 gap-0">
      <h1 className="text-xl">Notifications</h1>
      {notifications.length > 0 ? (
        <ul className="flex flex-col gap-2 mt-2">
          {notifications.map((n) => (
            <li key={n.id}>{n.type === "FriendRequest" && <FriendRequestNotif resourceId={n.resourceId} actor={n.actor} />}</li>
          ))}
        </ul>
      ) : (
        <Empty />
      )}
    </div>
  );
}
