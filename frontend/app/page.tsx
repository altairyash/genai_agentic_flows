"use client";

import { useState, useRef, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactMarkdown from "react-markdown";

// Load Google Fonts
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageCounter = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      id: messageCounter.current++,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: "NextUser",
          threadId: "main",
          messages: [{ role: "user", content: input }],
        }),
      });
      const data = await res.json();

      const botMessage: Message = {
        sender: "bot",
        text: data.output?.trim() || "No response",
        id: messageCounter.current++,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errMessage: Message = {
        sender: "bot",
        text: "Error connecting to server",
        id: messageCounter.current++,
      };
      setMessages((prev) => [...prev, errMessage]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 font-roboto">
      <main className="flex flex-col w-full max-w-4xl h-[90vh] bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-700">
        <header className="px-6 py-5 bg-zinc-800 font-bold text-2xl text-white border-b border-zinc-700">
          Converge
        </header>

        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="flex-1 px-6 py-4 overflow-auto flex flex-col gap-3 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900"
        >
          <InfiniteScroll
            dataLength={messages.length}
            next={() => {}}
            hasMore={false}
            loader={null}
            scrollableTarget="scrollableDiv"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl max-w-md break-words shadow-md ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-zinc-800 text-white rounded-bl-none"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            className="underline text-blue-400 hover:text-blue-300"
                            target="_blank"
                            rel="noreferrer"
                          />
                        ),
                        li: ({ children }) => (
                          <li className="ml-5 list-disc">{children}</li>
                        ),
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-5 py-3 rounded-2xl max-w-md break-words bg-zinc-800 text-white animate-pulse rounded-bl-none shadow-md">
                  ...
                </div>
              </div>
            )}
          </InfiniteScroll>
        </div>

        <footer className="px-6 py-4 border-t border-zinc-700 flex gap-3 bg-zinc-800">
          <input
            className="flex-1 border border-zinc-600 rounded-xl px-4 py-3 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-shadow shadow-md"
            onClick={sendMessage}
          >
            Send
          </button>
        </footer>
      </main>
    </div>
  );
}
