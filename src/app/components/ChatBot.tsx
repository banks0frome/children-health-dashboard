import { useRef, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { useLayoutContext } from "./Layout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const EXAMPLE_QUERIES = [
  "Most requested materials?",
  "Events in Salt Lake County?",
  "Pending requests summary",
];

// Parse bold segments like **text** into React spans
function parseBoldSegments(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-on-surface">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Render structured markdown lines as React nodes
function renderContent(content: string): ReactNode {
  const lines = content.split("\n");
  const result: ReactNode[] = [];

  lines.forEach((line, i) => {
    if (!line.trim()) {
      result.push(<div key={i} className="h-1.5" />);
      return;
    }

    if (line.startsWith("> ")) {
      result.push(
        <div key={i} className="my-1 pl-3 border-l-2 border-primary/40 text-on-surface-muted italic text-xs">
          {parseBoldSegments(line.slice(2))}
        </div>
      );
      return;
    }

    if (line.startsWith("| ") || line.startsWith("|")) {
      const cells = line.split("|").filter((c) => c.trim());
      const isSeparator = cells.every((c) => /^[-:\s]+$/.test(c));
      if (isSeparator) return;
      result.push(
        <div key={i} className="flex gap-4 text-xs my-0.5">
          {cells.map((cell, ci) => (
            <span
              key={ci}
              className={
                ci === 0
                  ? "w-36 shrink-0 text-on-surface-muted"
                  : "font-semibold text-on-surface"
              }
            >
              {parseBoldSegments(cell.trim())}
            </span>
          ))}
        </div>
      );
      return;
    }

    const bulletMatch = line.match(/^[-•*]\s(.+)/);
    if (bulletMatch) {
      result.push(
        <div key={i} className="flex gap-2 my-0.5 text-sm">
          <span className="text-on-surface-muted mt-px shrink-0">•</span>
          <span>{parseBoldSegments(bulletMatch[1])}</span>
        </div>
      );
      return;
    }

    const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      result.push(
        <div key={i} className="flex gap-2 my-0.5 text-sm">
          <span className="text-on-surface-muted shrink-0 w-4 text-right text-xs mt-0.5">
            {numberedMatch[1]}.
          </span>
          <span>{parseBoldSegments(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Bold-only header lines (start and end with **)
    if (line.startsWith("**") && line.endsWith("**")) {
      result.push(
        <p key={i} className="text-xs font-bold text-on-surface-muted uppercase tracking-wide mt-1 mb-0.5">
          {line.slice(2, -2)}
        </p>
      );
      return;
    }

    result.push(
      <p key={i} className="my-0.5 text-sm">
        {parseBoldSegments(line)}
      </p>
    );
  });

  return <>{result}</>;
}

export function ChatBot() {
  const { chatMessages: messages, setChatMessages: setMessages } = useLayoutContext();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const result = await api.chat(trimmed);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMessage =
        err instanceof Error && err.message.includes("401")
          ? "AI assistant is not configured. Set CLAUDE_API_KEY to enable."
          : err instanceof Error && err.message.includes("API error")
          ? "AI assistant is not configured. Set CLAUDE_API_KEY to enable."
          : "Something went wrong. Please try again.";
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleChipClick(query: string) {
    sendMessage(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      sendMessage(input);
    }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div
      className="bg-surface-lowest rounded-xl flex flex-col overflow-hidden"
      style={{ boxShadow: "var(--shadow-ambient)", height: "420px" }}
    >
      {/* Header */}
      <div className="px-5 py-4 bg-surface-dim flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
        </div>
        <div>
          <p className="font-display font-bold text-sm text-on-surface leading-tight">
            AI Assistant
          </p>
          <p className="text-xs text-on-surface-muted">Ask about requests, materials, or events</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-approved animate-pulse" />
          <span className="text-xs text-on-surface-muted">Online</span>
        </div>
        <button
          onClick={() => {
            setMessages([{
              id: "welcome",
              role: "assistant" as const,
              content: "Hi! I'm your Children's Health assistant. Ask me about requests, materials, or events — or tap a quick query below.",
              timestamp: new Date(),
            }]);
          }}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-muted text-xs font-medium hover:bg-primary hover:text-white transition-colors cursor-pointer"
          title="Start a new chat session"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                  />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] ${
                msg.role === "user" ? "items-end" : "items-start"
              } flex flex-col gap-1`}
            >
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-surface-container-high text-on-surface rounded-tr-sm"
                    : "bg-surface-container-low text-on-surface rounded-tl-sm"
                }`}
              >
                {renderContent(msg.content)}
              </div>
              <span className="text-xs text-on-surface-muted px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                />
              </svg>
            </div>
            <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-on-surface-muted animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-on-surface-muted animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-on-surface-muted animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick chips */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => handleChipClick(q)}
            disabled={isTyping}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-muted hover:bg-primary hover:text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-1 shrink-0">
        <div className="flex items-center gap-2 bg-surface-dim rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-muted outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-primary hover:bg-primary-container text-white"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
