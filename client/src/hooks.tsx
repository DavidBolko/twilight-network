import { useContext, useEffect, useRef, useState, type RefObject } from "react";
import type { ChatMsg } from "./types";
import { Howl } from "howler";
import { QueryClient } from "@tanstack/react-query";
import { chatConnection, notificationConnection } from "./websockets";
import { UserContext } from "./providers/userProvider";
import { ToastContext } from "./providers/toastProvider";
import FriendRequestNotif from "./components/Notifications/FriendRequestNotif";
import { type Notification } from "../src/types";

export function useUser() {
  return useContext(UserContext);
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function useThemeToggler() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("dark_mode") === "1";
    setDark(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark_mode", dark ? "1" : "0");
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  return { dark, setDark, toggle };
}

export function useInfiniteScroll(_ref: RefObject<null>, fetchNextPage: VoidFunction, hasNextPage: boolean, isFetchingNextPage: boolean) {
  useEffect(() => {
    const ref = _ref.current;
    if (!ref) return;
    const scrollCallback = ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    const observer = new IntersectionObserver(scrollCallback, { rootMargin: "600px" });
    observer.observe(ref);
    return () => {
      observer.disconnect();
    };
  }, [_ref, hasNextPage, isFetchingNextPage, fetchNextPage]);
}

export function useSound() {
  const soundRef = useRef<Howl | null>(null);
  if (!soundRef.current) soundRef.current = new Howl({ src: ["/notif.wav"], volume: 0.5 });

  return (msg: ChatMsg, userId?: string) => {
    if (userId != null && userId !== msg.senderId) {
      soundRef.current?.play();
    }
  };
}

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export function useWs(queryClient: QueryClient) {
  const { addToast } = useToast();


  useEffect(() => {
    chatConnection.start().catch(console.error);
    return () => { chatConnection.stop(); };
  }, []);

  useEffect(() => {
    if (chatConnection.state === "Disconnected") {
      chatConnection.start().catch(console.error);
    }
    if (notificationConnection.state === "Disconnected") {
      notificationConnection.start().catch(console.error);
    }

    notificationConnection.on("NewNotification", (notification: Notification) => {
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => [notification, ...old]);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (notification.type === "FriendRequest") {
        addToast(<FriendRequestNotif resourceId={notification.resourceId} actor={notification.actor} />);
      }
    });

    return () => {
      notificationConnection.off("NewNotification");
      if (chatConnection.state === "Connected") chatConnection.stop();
      if (notificationConnection.state === "Connected") notificationConnection.stop();
    };
  }, [queryClient, addToast]);
}
