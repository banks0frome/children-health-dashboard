import { Outlet, useOutletContext } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LayoutContext {
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function useLayoutContext() {
  return useOutletContext<LayoutContext>();
}

export function Layout() {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Children's Health assistant. Ask me about requests, materials, or events — or tap a quick query below.",
      timestamp: new Date(),
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ chatMessages, setChatMessages, searchQuery, setSearchQuery }} />
        </main>
      </div>
    </div>
  );
}
