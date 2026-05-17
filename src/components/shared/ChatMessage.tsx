interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-[var(--radius-md)] px-3.5 py-2.5 ${
          isUser ? "bg-[var(--color-primary-light)]" : "bg-[var(--color-bg-muted)]"
        }`}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            {isUser ? "User" : "Assistant"}
          </span>
          {timestamp && (
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
