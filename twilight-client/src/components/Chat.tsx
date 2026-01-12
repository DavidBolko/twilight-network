import { ArrowLeft, SendIcon, XIcon } from "lucide-react";
import { useState } from "react";

function Chat() {
  const [open, setOpen] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeUser, setActiveUser] = useState("Davidko");
  const [message, setMessage] = useState("");

  if (!open) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full lg:w-[550px] lg:right-12 px-3 pb-3 lg:px-0 lg:pb-0">
      <div className="card backdrop-blur-xl bg-tw-surface/50 p-0 rounded-b-none h-[70vh] lg:h-[40vh] overflow-hidden flex flex-col">
        {/* ONE TOP BAR (mobile aj desktop) */}
        <div className="px-2 py-2 border-b border-white/10 flex items-center">
          {/* LEFT */}
          <div className="w-10 flex items-center justify-start">
            {/* na mobile v chat view ukáž back, inak nič */}
            {showChat && (
              <button className="p-2 rounded-lg hover:bg-white/5 lg:hidden" onClick={() => setShowChat(false)} aria-label="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* CENTER */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            {/* mobile */}
            <div className="lg:hidden flex items-center justify-center gap-2 min-w-0">
              {showChat ? (
                <>
                  <img src="/anonymous.png" className="w-7 h-7 rounded-full border border-tw-border/80" />
                  <p className="text-sm text-tw-muted truncate">{activeUser}</p>
                </>
              ) : (
                <p className="text-sm font-medium">Chat</p>
              )}
            </div>

            {/* desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <p className="text-sm font-medium">Chat</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-10 flex items-center justify-end">
            <button className="p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(false)} aria-label="Close chat">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DESKTOP split */}
        <div className="hidden lg:flex flex-1">
          <aside className="w-52 border-r border-white/10 overflow-auto">
            <button className="w-full p-3 flex items-center gap-3 hover:bg-white/5" onClick={() => setActiveUser("Davidko")}>
              <img src="/anonymous.png" className="w-8 h-8 rounded-full border border-tw-border/80" />
              <div className="text-left">
                <p className="text-sm">Davidko</p>
                <p className="text-xs text-tw-muted">Last seen: 2h</p>
              </div>
            </button>
          </aside>

          <section className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-auto p-3 space-y-2">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white/10 text-sm">Ahoj 👋</div>
              <div className="max-w-[85%] ml-auto rounded-2xl px-3 py-2 bg-white/20 text-sm">Čau 😄</div>
            </div>

            <form
              className="p-3 border-t border-white/10 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!message.trim()) return;
                setMessage("");
              }}>
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none" placeholder="Write a message..." />
              <button type="submit" className="btn primary px-3" disabled={!message.trim()}>
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </section>
        </div>

        {/* MOBILE: list <-> chat */}
        <div className="lg:hidden flex-1">
          {!showChat ? (
            <div className="h-full overflow-auto">
              <button
                className="w-full p-4 flex items-center gap-3 border-b border-white/10"
                onClick={() => {
                  setActiveUser("Davidko");
                  setShowChat(true);
                }}>
                <img src="/anonymous.png" className="w-10 h-10 rounded-full border border-tw-border/80" />
                <div className="text-left">
                  <p className="text-sm">Davidko</p>
                  <p className="text-xs text-tw-muted">Last seen: 2h</p>
                </div>
              </button>
            </div>
          ) : (
            <section className="h-full flex flex-col">
              <div className="flex-1 overflow-auto p-3 space-y-2">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white/10 text-sm">Ahoj 👋</div>
                <div className="max-w-[85%] ml-auto rounded-2xl px-3 py-2 bg-white/20 text-sm">Čau 😄</div>
              </div>

              <form
                className="p-3 border-t border-white/10 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!message.trim()) return;
                  setMessage("");
                }}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none" placeholder="Write a message..." />
                <button type="submit" className="btn primary px-3" disabled={!message.trim()}>
                  <SendIcon className="w-4 h-4" />
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
