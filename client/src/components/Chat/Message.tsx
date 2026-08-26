import { Link } from "@tanstack/react-router";
import type { ChatMsg } from "../../types";
import { useUser } from "../../hooks";

type Props = {
  message: ChatMsg;
};

export default function Message({ message }: Props) {
  const user = useUser();
  if (!user) return null;

  const isSender = message.senderId === user.id;

  return (
    <div className={`flex flex-col gap-1 w-full min-w-0 ${isSender ? "items-end" : "items-start"}`}>
      <Link to="/user/$id" params={{ id: message.senderId! }} search={{ tab: "Posts" }} className="flex flex-row items-center gap-1.5 hover:underline">
        <img className="avatar size-6" src="/anonymous.png" alt="" />
        <p className="text-xs text-tw-muted">{message.senderName}</p>
      </Link>
      <span className={`px-3 py-1.5 rounded-2xl text-sm max-w-[75%] break-all ${isSender ? "bg-tw-primary/50" : "bg-tw-primary/20"}`}>{message.text}</span>
    </div>
  );
}
