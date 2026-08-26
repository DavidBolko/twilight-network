import { ChevronLeft, SendIcon, XIcon } from "lucide-react";
import { SearchInput } from "../SearchInput";
import ChannelCard from "./ChannelCard";
import Message from "./Message";
import type { ChatProps } from "../Chat";
import { memo, useState } from "react";


function ChatMobile({ channels, messages, setOpen, setChannel, search, channelName, setSearch, channel, send, mobileBottomRef }: ChatProps) {
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    send(message);
    setMessage("");
  };

  return (
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
          <ul className="flex flex-col flex-1 overflow-y-auto divide-y divide-tw-light-border dark:divide-tw-border">
            {channels.map((c) => (
              <li key={c.id}>
                <ChannelCard channel={c} pickChannel={setChannel} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <ul className="flex flex-col flex-1 gap-2 overflow-y-auto p-2">
            {messages.map((m) => (
              <li key={m.id}>
                <Message message={m} />
              </li>
            ))}
            <div ref={mobileBottomRef} />
          </ul>
          <form className="flex flex-row gap-2 p-2 shrink-0 divider-top" onSubmit={handleSend}>
            <input type="text" className="flex-1" value={message} onChange={(e) => setMessage(e.target.value)} />
            <button type="submit" className="btn btn-primary shrink-0"><SendIcon size={16} /></button>
          </form>
        </>
      )}
    </div>
  );
}
export default memo(ChatMobile);