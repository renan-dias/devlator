import React, { useEffect, useRef, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: number;
  context: string[];
};

const LOCAL_KEY = "devlator-chat-history";

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(messages));
}

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOCAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export default function ChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    saveMessages(messages);
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={ref} className="max-h-80 overflow-y-auto p-2 bg-white/10 dark:bg-black/20 rounded-lg border border-white/20 shadow-inner backdrop-blur">
      {messages.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-4">Nenhuma conversa ainda.</div>
      )}
      {messages.map((msg) => (
        <div key={msg.id} className={`my-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`px-3 py-2 rounded-lg max-w-xs whitespace-pre-line ${msg.role === "user" ? "bg-blue-500/80 text-white" : "bg-white/80 text-black dark:bg-black/80 dark:text-white"}`}>
            {msg.content}
            {msg.context?.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">[{msg.context.join(", ")}]</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function addMessage(msg: ChatMessage) {
  const messages = loadMessages();
  messages.push(msg);
  saveMessages(messages);
}
