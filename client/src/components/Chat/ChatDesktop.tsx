import { SendIcon, XIcon } from "lucide-react";
import { SearchInput } from "../SearchInput";
import ChannelCard from "./ChannelCard";
import Message from "./Message";
import { memo, useState } from "react";

function ChatDesktop({ channels, messages, setOpen, setChannel, search, setSearch, channel, send, desktopBottomRef }: ChatProps) {
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    send(message);
    setMessage("");
  };

  return (
    <div className="hidden lg:flex flex-col fixed right-16 bottom-0 max-w-[45rem] h-[24rem] card p-0 gap-0 overflow-hidden">

      <div className="flex flex-row p-2 gap-2 justify-between items-center divider-bottom">
        <SearchInput value={search} onChange={setSearch} />
        <span className="px-48">Chat</span>
        <button className="btn btn-muted p-2 shrink-0" onClick={() => setOpen(false)}>
          <XIcon size={16} />
        </button>
      </div>

      <div className="flex flex-row flex-1 min-h-0">
        <ul className="flex flex-col min-w-48 max-w-64 divide-y divide-tw-light-border dark:divide-tw-border overflow-y-auto">
          {channels.map((c) => (
            <li key={c.id}>
              <ChannelCard channel={c} pickChannel={setChannel} />
            </li>
          ))}
        </ul>

        <div className="flex flex-col flex-1 min-h-0 divider-left">
          {channel ? (
            <>
              <ul className="flex flex-col flex-1 gap-2 overflow-y-auto p-2">
                {messages.map((m) => (
                  <li key={m.id}>
                    <Message message={m} />
                  </li>
                ))}
                <div ref={desktopBottomRef} />
              </ul>
              <form className="flex flex-row gap-2 p-2 shrink-0 divider-top" onSubmit={handleSend}>
                <input type="text" className="flex-1" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type="submit" className="btn btn-primary shrink-0">
                  <SendIcon size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center gap-2">
              <img className="size-32 opacity-50" src="/anonymous.png" alt="" />
              <p className="text-tw-muted text-xs">Open a chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default memo(ChatDesktop);