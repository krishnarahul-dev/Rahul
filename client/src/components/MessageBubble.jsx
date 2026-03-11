import { useMemo } from "react";

/** Highlight @mentions inside message text. */
function renderMessage(text) {
  const parts = text.split(/(@\w[\w. ]*)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="mention">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isOwn, showAvatar, colorFor }) {
  const sender = message.sender || {};
  const initials = (sender.name || "?")[0].toUpperCase();
  const bgColor  = useMemo(() => colorFor(sender.name), [sender.name, colorFor]);

  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""} ${showAvatar ? "mt-3" : "mt-0.5"}`}>
      {/* Avatar column */}
      <div className="w-7 shrink-0">
        {showAvatar && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase select-none"
            style={{ backgroundColor: bgColor }}
            title={sender.name}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {showAvatar && !isOwn && (
          <p className="text-[11px] font-medium text-gray-500 mb-0.5 ml-1">
            {sender.name}
          </p>
        )}
        <div
          className={`
            px-3.5 py-2 text-sm leading-relaxed rounded-2xl
            ${isOwn
              ? "bg-cflow-600 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
            }
          `}
        >
          {renderMessage(message.message)}
        </div>
        <p className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? "text-right mr-1" : "ml-1"}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
