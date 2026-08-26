import { ChevronLeft, ChevronUp, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../api";
import { useUser } from "../userContext";
import { channelSchema, type Channel, type ChatMsg } from "../types";
import { chatConnection } from "../websockets";
import { useSound } from "../hooks";
import { SearchInput } from "./SearchInput";
import ChannelList from "./Chat/ChannelList";
import MessageList from "./Chat/MessageList";
import MessageForm from "./Chat/MessageForm";
import ChatEmpty from "./Chat/ChatEmpty";

type Props = {
  setOpen: (v: boolean) => void;
  open: boolean;
};

export default function _Chat({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const user = useUser();
  const playSound = useSound();

  const [channel, setChannel] = useState<number>();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const desktopBottomRef = useRef<HTMLDivElement>(null);
  const mobileBottomRef = useRef<HTMLDivElement>(null);

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      const data = await api.get<unknown[]>("channels");
      return data.map((c) => channelSchema.parse(c));
    },
    refetchInterval: 60_000,
  });

  const { data: messages = [] } = useQuery<ChatMsg[]>({
    queryKey: ["messages", channel],
    queryFn: () => api.get(`channels/${channel}/messages`),
    enabled: !!channel,
  });

  const currentChannel = channels.find((c) => c.id === channel);
  const channelName = currentChannel?.type === "DIRECT"
    ? currentChannel.participants.find((p) => p.userId !== user?.id)?.userName
    : (currentChannel?.title ?? "Chat");

  const filteredChannels = channels.filter((c) => {
    if (!search.trim()) return true;
    const name = c.type === "DIRECT"
      ? c.participants.find((p) => p.userId !== user?.id)?.userName ?? ""
      : c.title ?? "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    desktopBottomRef.current?.scrollIntoView({ behavior: "instant" });
    mobileBottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, open]);

  useEffect(() => {
    if (!channel) return;

    chatConnection.invoke("JoinChannel", channel.toString());

    const handleMessage = (msg: ChatMsg) => {
      const targetChannelId = msg.channelId ?? channel;
      queryClient.setQueryData(
        ["messages", Number(targetChannelId)],
        (old: ChatMsg[] = []) => old.some((m) => m.id === msg.id) ? old : [...old, msg]
      );
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      if (user?.id != null && user.id !== msg.senderId) {
        playSound(msg, user.id);
      }
    };

    chatConnection.on("NewMessage", handleMessage);
    return () => { chatConnection.off("NewMessage", handleMessage); };
  }, [channel, queryClient, playSound, user?.id]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || !channel) return;
    try {
      await api.post(`channels/${channel}/messages`, { text });
      queryClient.invalidateQueries({ queryKey: ["messages", channel] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }, [channel, queryClient]);

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        className="card flex flex-row fixed right-16 bottom-0 max-w-[24rem] justify-between items-center p-3 cursor-pointer card-interactive"
      >
        <span className="font-medium">Chat</span>
        <ChevronUp size={16} />
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-col fixed right-16 bottom-0 w-[45rem] h-[24rem] card p-0 gap-0 overflow-hidden">
        <div className="flex flex-row gap-2 p-2 items-center shrink-0 divider-bottom">
          <SearchInput value={search} onChange={setSearch} />
          <button className="btn btn-muted p-2 shrink-0" onClick={() => setOpen(false)}>
            <XIcon size={16} />
          </button>
        </div>

        <div className="flex flex-row flex-1 min-h-0 min-w-0">
          <div className="flex flex-col w-48 shrink-0 divider-right overflow-hidden">
            <ChannelList channels={filteredChannels} onPick={setChannel} />
          </div>
          <div className="flex flex-col flex-1 min-h-0 min-w-0">
            {channel
              ? <><MessageList messages={messages} bottomRef={desktopBottomRef} /><MessageForm message={message} setMessage={setMessage} onSend={send} /></>
              : <ChatEmpty />
            }
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-tw-light-bg dark:bg-tw-bg">
        <div className="flex flex-row p-2 gap-2 justify-between items-center shrink-0 divider-bottom">
          {channel
            ? <button className="btn btn-muted p-2" onClick={() => setChannel(undefined)}><ChevronLeft size={16} /></button>
            : <span className="font-medium">Chat</span>
          }
          <span className="font-medium">{channel ? channelName : ""}</span>
          <button className="btn btn-muted p-2" onClick={() => setOpen(false)}><XIcon size={16} /></button>
        </div>

        {!channel ? (
          <>
            <div className="p-2 shrink-0">
              <SearchInput value={search} onChange={setSearch} />
            </div>
            <ChannelList channels={filteredChannels} onPick={setChannel} />
          </>
        ) : (
          <><MessageList messages={messages} bottomRef={mobileBottomRef} /><MessageForm message={message} setMessage={setMessage} onSend={send} /></>
        )}
      </div>
    </>
  );
}