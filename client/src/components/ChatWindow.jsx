import { useState, useEffect, useRef, useCallback } from "react";
import { getConversation, getMessages, searchUsers } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import MessageBubble from "./MessageBubble";
import MentionDropdown from "./MentionDropdown";

// ── Avatars color palette ──────────────────────────────────
const COLORS = [
  "#3182fc", "#e74c8b", "#f59e0b", "#10b981",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316",
];
function colorFor(name = "") {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function ChatWindow({ workflowId, currentUser }) {
  // ── State ──────────────────────────────────────────────
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(true);
  const [typingUsers, setTypingUsers]   = useState({});
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);

  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const typingTimer = useRef(null);

  // ── Load conversation + messages on mount ──────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const convo = await getConversation(workflowId);
        if (cancelled) return;
        setConversation(convo);

        const msgs = await getMessages(convo.id);
        if (cancelled) return;
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [workflowId]);

  // ── Socket.io handlers ─────────────────────────────────
  const handleNewMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const handleTyping = useCallback((data) => {
    setTypingUsers((prev) => ({ ...prev, [data.user_id]: data.name }));
  }, []);

  const handleStopTyping = useCallback((data) => {
    setTypingUsers((prev) => {
      const next = { ...prev };
      delete next[data.user_id];
      return next;
    });
  }, []);

  const { sendMessage, emitTyping, emitStopTyping } = useSocket({
    workflowId,
    user: currentUser,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  // ── Auto-scroll on new messages ────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingUsers]);

  // ── @Mention detection ─────────────────────────────────
  useEffect(() => {
    const cursorPos = inputRef.current?.selectionStart ?? input.length;
    const textBefore = input.slice(0, cursorPos);
    const mentionMatch = textBefore.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionIndex(0);
      if (query.length >= 1) {
        searchUsers(query).then(setMentionResults).catch(() => setMentionResults([]));
      } else {
        setMentionResults([]);
      }
    } else {
      setMentionQuery(null);
      setMentionResults([]);
    }
  }, [input]);

  // ── Insert mention into input ──────────────────────────
  const insertMention = (user) => {
    const cursorPos = inputRef.current?.selectionStart ?? input.length;
    const textBefore = input.slice(0, cursorPos);
    const textAfter  = input.slice(cursorPos);
    const newBefore  = textBefore.replace(/@\w*$/, `@${user.name} `);
    setInput(newBefore + textAfter);
    setMentionQuery(null);
    setMentionResults([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // ── Send ───────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput("");
    emitStopTyping();
    inputRef.current?.focus();
  };

  // ── Typing indicator (debounced) ───────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(), 1500);
  };

  // ── Key handling ───────────────────────────────────────
  const handleKeyDown = (e) => {
    // Mention navigation
    if (mentionResults.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionResults.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(mentionResults[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        setMentionResults([]);
        return;
      }
    }

    // Normal enter → send
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived data ───────────────────────────────────────
  const typingNames = Object.values(typingUsers).filter(
    (n) => n !== currentUser.name
  );

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-cflow-400" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-cflow-400" />
          <span className="typing-dot w-2.5 h-2.5 rounded-full bg-cflow-400" />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-cflow-600 to-cflow-700">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {conversation?.title || `Workflow #${workflowId}`}
          </h2>
          <p className="text-[11px] text-white/60">
            {conversation?.participants?.length || 0} participants
          </p>
        </div>
        {/* Participant avatars */}
        <div className="flex -space-x-2">
          {(conversation?.participants || []).slice(0, 5).map((p) => (
            <div
              key={p.id}
              title={p.name}
              className="w-7 h-7 rounded-full border-2 border-cflow-700 flex items-center justify-center text-[10px] font-bold text-white uppercase"
              style={{ backgroundColor: colorFor(p.name) }}
            >
              {p.name?.[0]}
            </div>
          ))}
        </div>
      </div>

      {/* ── Messages ────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-5 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" className="mb-3 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-0.5">Start the conversation for this workflow</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn     = msg.sender?.id === currentUser.id || msg.sender_id === currentUser.id;
          const prevMsg   = messages[idx - 1];
          const sameSender = prevMsg && (prevMsg.sender?.id || prevMsg.sender_id) === (msg.sender?.id || msg.sender_id);
          const showAvatar = !sameSender;

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              colorFor={colorFor}
            />
          );
        })}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 pt-1 pl-10">
            <div className="flex gap-1">
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400" />
            </div>
            <span className="text-xs text-gray-400">
              {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing…
            </span>
          </div>
        )}
      </div>

      {/* ── Input ───────────────────────────────── */}
      <div className="relative px-4 pb-4 pt-2">
        {/* Mention autocomplete dropdown */}
        {mentionResults.length > 0 && (
          <MentionDropdown
            results={mentionResults}
            activeIndex={mentionIndex}
            onSelect={insertMention}
            colorFor={colorFor}
          />
        )}

        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-cflow-400 focus-within:ring-2 focus-within:ring-cflow-100 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (use @ to mention)"
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-gray-800 placeholder-gray-400 outline-none max-h-28 leading-relaxed"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-cflow-600 text-white hover:bg-cflow-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
