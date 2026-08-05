import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Wifi, WifiOff, X, AlertTriangle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { UserDetailsProvider } from "../context/UserDetailsContext";
import { useAreaSocket } from "../hooks/useAreaSocket";
import { normalizeAreaName } from "../context/myurl";

const DEFAULT_AREA = "kathmandu";

function statusLabel(status) {
  switch (status) {
    case "open":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "closed":
      return "Disconnected";
    case "error":
      return "Error";
    default:
      return status;
  }
}

const AreaChatInner = () => {
  const { areaName: areaParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialArea =
    normalizeAreaName(areaParam || searchParams.get("area") || DEFAULT_AREA);

  const [areaInput, setAreaInput] = useState(initialArea);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const {
    status,
    messages,
    activeAlert,
    error,
    sendChat,
    dismissAlert,
    reconnect,
    area,
  } = useAreaSocket(initialArea);

  useEffect(() => {
    setAreaInput(area);
  }, [area]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const joinArea = (e) => {
    e.preventDefault();
    const next = normalizeAreaName(areaInput);
    if (!next) return;
    navigate(`/area-chat/${next}`);
    setSearchParams({});
  };

  const onSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const ok = sendChat(draft);
    if (ok) {
      setDraft("");
    } else {
      toast.error("Not connected — try Reconnect");
    }
  };

  const connected = status === "open";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-100 via-emerald-50/40 to-stone-100">
      <Toaster position="top-center" />
      <UserDetailsProvider>
        <Navigation />
      </UserDetailsProvider>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="text-emerald-700" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
              Area channel
            </h1>
          </div>
          <p className="text-stone-600 text-sm md:text-base">
            Live chat and weather alerts for one area — one WebSocket connection.
          </p>
        </header>

        <form
          onSubmit={joinArea}
          className="flex flex-col sm:flex-row gap-2 mb-4"
        >
          <input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            placeholder="Area / city (e.g. kathmandu)"
            className="flex-1 rounded-lg border border-stone-300 bg-white/80 px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 transition-colors"
          >
            Join area
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 mb-3 text-sm">
          <div className="flex items-center gap-2 text-stone-700">
            {connected ? (
              <Wifi size={16} className="text-emerald-600" />
            ) : (
              <WifiOff size={16} className="text-stone-400" />
            )}
            <span>
              <strong className="font-semibold">{area}</strong>
              {" · "}
              {statusLabel(status)}
            </span>
          </div>
          {!connected && (
            <button
              type="button"
              onClick={reconnect}
              className="text-emerald-800 font-medium underline-offset-2 hover:underline"
            >
              Reconnect
            </button>
          )}
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <AnimatePresence>
          {activeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex gap-3 items-start shadow-sm"
            >
              <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={20} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-950">
                  {activeAlert.title || "System alert"}
                </p>
                <p className="text-sm text-amber-900 mt-0.5">{activeAlert.message}</p>
                {activeAlert.alert_type && (
                  <p className="text-xs uppercase tracking-wide text-amber-700 mt-1">
                    {activeAlert.alert_type}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismissAlert}
                className="text-amber-800 hover:text-amber-950"
                aria-label="Dismiss alert"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl border border-stone-200 bg-white/90 shadow-sm overflow-hidden flex flex-col h-[min(62vh,560px)]">
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
          >
            {messages.length === 0 && (
              <p className="text-center text-stone-500 text-sm py-10">
                No messages yet. Say hello to people in{" "}
                <span className="font-medium text-stone-700">{area}</span>.
              </p>
            )}
            {messages.map((m, i) => {
              const key = m.id != null ? `${m.type}-${m.id}` : `${m.type}-${i}-${m.created_at}`;
              if (m.type === "alert") {
                return (
                  <div
                    key={key}
                    className="mx-auto max-w-[92%] rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-950"
                  >
                    <span className="font-semibold">
                      {m.title || "Alert"} · SafeSignal Bot
                    </span>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.message}</p>
                  </div>
                );
              }
              const isBot = m.sender === "SafeSignal Bot";
              const isWeather =
                isBot && String(m.message || "").startsWith("Weather update");
              if (isWeather) {
                const lines = String(m.message)
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean);
                const title = lines[0] || "Weather update";
                const body = lines.slice(1);
                return (
                  <div
                    key={key}
                    className="rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-2.5 max-w-[92%] shadow-sm"
                  >
                    <p className="text-xs font-semibold text-teal-800 mb-1.5">
                      SafeSignal Bot
                    </p>
                    <p className="text-sm font-semibold text-stone-900 mb-2">
                      {title}
                    </p>
                    <dl className="space-y-1 text-sm text-stone-800">
                      {body.map((line) => {
                        const idx = line.indexOf(":");
                        if (idx > 0 && !line.startsWith("📍")) {
                          return (
                            <div
                              key={line}
                              className="flex gap-2 border-t border-teal-100/80 pt-1 first:border-0 first:pt-0"
                            >
                              <dt className="w-24 shrink-0 text-stone-500">
                                {line.slice(0, idx)}
                              </dt>
                              <dd className="font-medium">{line.slice(idx + 1).trim()}</dd>
                            </div>
                          );
                        }
                        return (
                          <p key={line} className="font-medium text-stone-900">
                            {line}
                          </p>
                        );
                      })}
                    </dl>
                    {m.created_at && (
                      <p className="text-[10px] text-stone-400 mt-2">
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  className={`rounded-lg px-3 py-2 max-w-[90%] ${
                    isBot
                      ? "bg-teal-50 border border-teal-100"
                      : "bg-stone-50 border border-stone-100"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold mb-0.5 ${
                      isBot ? "text-teal-700" : "text-emerald-800"
                    }`}
                  >
                    {m.sender || "user"}
                  </p>
                  <p className="text-stone-900 text-sm whitespace-pre-wrap break-words">
                    {m.message}
                  </p>
                  {m.created_at && (
                    <p className="text-[10px] text-stone-400 mt-1">
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={onSend}
            className="border-t border-stone-200 bg-stone-50/80 p-3 flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                connected
                  ? "Type a message…  (try /update for weather)"
                  : "Waiting for connection…"
              }
              disabled={!connected}
              className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!connected || !draft.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-800 text-white px-4 py-2.5 font-medium hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
              Send
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const AreaChat = () => <AreaChatInner />;

export default AreaChat;
