import { useUser } from "../../hooks";
import type { Channel } from "../../types";
import { formatWhen } from "../../utils";

type Props = {
  pickChannel: (id: number) => void;
  channel: Channel;
  activeChannelId: number | undefined,
  setChannelName: (name: string | undefined | null) => void;
};

export default function ChannelCard({ pickChannel, channel, activeChannelId, setChannelName }: Props) {
  const user = useUser();
  if (user == null) return null;

  const channelName = channel.type === "DIRECT"
    ? channel.participants.find((p) => p.userId !== user.id)?.userName
    : channel.title;

  return (
    <button
      className={`card-interactive flex flex-row items-center gap-2 p-2 w-full text-left ${activeChannelId === channel.id ? "bg-tw-primary/25" : ""}`}
onClick={() => { pickChannel(channel.id); setChannelName(channelName); }}
    >
      <img src="/anonymous.png" className="avatar size-10 shrink-0" alt="" />
      <div className="flex flex-col min-w-0">
        <p className="text-sm truncate font-medium">{channelName}</p>
        <p className="text-xs text-tw-muted truncate">{formatWhen(channel.lastMessageAt ?? "")}</p>
      </div>
    </button>
  );
}