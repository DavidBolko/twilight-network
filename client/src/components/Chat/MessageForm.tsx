import { SendIcon } from "lucide-react";

type Props = {
  message: string;
  setMessage: (v: string) => void;
  onSend: (text: string) => void;
};

export default function MessageForm({ message, setMessage, onSend }: Props) {
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form className="flex flex-row gap-2 p-2 shrink-0 divider-top" onSubmit={handleSend}>
      <input
        type="text"
        className="flex-1 min-w-0"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message..."
      />
      <button type="submit" className="btn btn-primary shrink-0">
        <SendIcon size={16} />
      </button>
    </form>
  );
}