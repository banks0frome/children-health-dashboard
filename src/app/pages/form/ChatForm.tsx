import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, ArrowRight } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUERIES = [
  "I need materials for an event",
  "Can you send us car seat safety cards?",
  "We're hosting a community fair",
];

export function ChatForm() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I can help you request safety materials or event support. What are you planning?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [readyToReview, setReadyToReview] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/form/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = (await res.json()) as {
        message?: string;
        response?: string;
        ready_to_review?: boolean;
        extracted?: Record<string, unknown>;
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || data.response || "I understand. Can you tell me more?",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (data.ready_to_review) {
        setReadyToReview(true);
        setExtractedData(data.extracted || null);
      }
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I had trouble processing that. Could you try again?",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleReview() {
    navigate("/form/confirm", { state: { extracted: extractedData, source: "chat" } });
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-2xl font-display font-bold text-on-surface">Chat with AI</h1>
        <p className="text-sm text-on-surface-muted mt-1">
          Tell us what you need in your own words. Our AI will help build your request.
        </p>
      </div>

      {/* Messages */}
      <div
        className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[400px] px-1"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-surface-container-low text-on-surface rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 motion-safe:animate-spin text-on-surface-muted" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Review CTA */}
      {readyToReview && (
        <button
          type="button"
          onClick={handleReview}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-secondary text-white font-semibold text-sm hover:bg-secondary/90 transition-colors cursor-pointer motion-safe:animate-[scale-in_0.3s_ease-out]"
        >
          Review your request
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Example chips */}
      {messages.length <= 2 && !readyToReview && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="px-4 py-2 rounded-full bg-surface-container-low text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex items-center gap-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 px-4 py-3 rounded-full bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-muted/50 transition-colors focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
