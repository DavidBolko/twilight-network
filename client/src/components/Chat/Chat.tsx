import { ChevronLeft, ChevronUp, SendIcon, XIcon } from "lucide-react";
import { SearchInput } from "../SearchInput";
import { useQuery } from "@tanstack/react-query";
import { channelSchema, type Channel, type ChatMsg } from "../../types";
import { api } from "../../api";
import ChannelCard from "./ChannelCard";
import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import Message from "./Message";
import { useChatStore } from "../../appStores";
import { chatConnection } from "../../websockets";
import { queryClient } from "../../main";
import { useSound, useUser } from "../../hooks";

export default function Chat() {
  const [channel, setChannel] = useState<number | undefined>(undefined);
  const [channelName, setChannelName] = useState<string | undefined | null>("Chat");
  const { chatOpen, setChatOpen } = useChatStore();
  const [message, setMessage] = useState("");

  const user = useUser();
  const playSound = useSound();

  const bottomRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages]);

  useEffect(() => {
    if (!channel) return;

    chatConnection.invoke("JoinChannel", channel.toString());

    const handleMessage = (msg: ChatMsg) => {
      const targetChannelId = msg.channelId ?? channel;
      queryClient.setQueryData(["messages", Number(targetChannelId)], (old: ChatMsg[] = []) => (old.some((m) => m.id === msg.id) ? old : [...old, msg]));
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      if (user?.id != null && user.id !== msg.senderId) {
        playSound(msg, user.id);
      }
    };

    chatConnection.on("NewMessage", handleMessage);
    return () => {
      chatConnection.off("NewMessage", handleMessage);
    };
  }, [channel, playSound, user?.id]);

  const send = useCallback(
    async (e: SyntheticEvent, text: string) => {
      e.preventDefault()
      if (!text.trim() || !channel) return;
      setMessage(""); 
      try {
        await api.post(`channels/${channel}/messages`, { text });
        queryClient.invalidateQueries({ queryKey: ["messages", channel] });
        queryClient.invalidateQueries({ queryKey: ["channels"] });
      } catch (error) {
        console.error("Failed to send message", error);
      }
    },
    [channel],
  );

  if (!chatOpen) {
    return (
      <div className="card w-2/6 fixed right-16 bottom-0 p-0 max-w-[24rem] border-0 rounded-b-none">
        <div onClick={() => setChatOpen(true)} className="card card-interactive border-b-0 rounded-b-none justify-between items-center cursor-pointer">
          <span className="font-medium">Chat</span>
          <ChevronUp size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="card fixed inset-0 p-0 z-50 border-0 rounded-none lg:rounded-md lg:border border-tw-border rounded-b-none flex flex-col lg:inset-auto lg:right-16 lg:bottom-0 lg:w-[45rem] lg:h-[24rem] gap-0 overflow-hidden">
      <header className="flex p-2 border-b border-tw-border justify-between items-center shrink-0">
        <button onClick={() => setChannel(undefined)} className={`btn-icon-primary order-2 lg:order-1 ${channel != undefined ? "block lg:hidden" : "hidden"}`}>
          <ChevronLeft />
        </button>
        <span className={`order-2 lg:order-1 ${channel ? "lg:block hidden" : ""}`}>
          <SearchInput />
        </span>
        <span className={`text-md font-semibold order-1 lg:order-2 ${channel ? "order-2" : "order"}`}>{channelName}</span>
        <button onClick={() => setChatOpen(!open)} className="btn-icon-danger order-3">
          <XIcon />
        </button>
      </header>
      <div className={`flex flex-1 min-h-0 chat-open`}>
        <ul className={`flex flex-col flex-1 w-full lg:border-r lg:max-w-48 border-tw-border divide-tw-light-border dark:divide-tw-border overflow-y-auto ${channel ? "hidden lg:block" : ""}`}>
          {channels.map((c) => (
            <li key={c.id}>
              <ChannelCard channel={c} setChannelName={setChannelName} activeChannelId={channel} pickChannel={setChannel} />
            </li>
          ))}
        </ul>
        <div className={`flex flex-col flex-1 min-h-0 overflow-hidden ${channel ? "" : "hidden lg:flex"}`}>
          <ul className="flex flex-col flex-1 overflow-y-auto gap-2 p-2">
            {messages.map((m) => (
              <li key={m.id} className="min-w-0">
                <Message message={m} />
              </li>
            ))}
            <div ref={bottomRef} />
          </ul>
          <form onSubmit={(e) => send(e, message)} className="flex flex-row gap-2 p-2 shrink-0 border-t border-tw-border bg-tw-surface">
            <input type="text" className="flex-1 min-w-0" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." />
            <button type="submit" className="btn btn-primary shrink-0">
              <SendIcon size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
