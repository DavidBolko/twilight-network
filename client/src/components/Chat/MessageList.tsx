import type { ChatMsg } from "../../types";
import Message from "./Message";

type Props = {
  messages: ChatMsg[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function MessageList({ messages, bottomRef }: Props) {
  return (
    <ul className="flex flex-col flex-1 gap-2 overflow-y-auto p-2 min-w-0">
      {messages.map((m) => (
        <li key={m.id} className="min-w-0">
          <Message message={m} />
        </li>
      ))}
      <div ref={bottomRef} />
    </ul>
  );
}