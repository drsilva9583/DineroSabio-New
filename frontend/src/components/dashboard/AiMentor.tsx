"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareMore, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  language?: "en" | "es";
}

export default function AiMentor({ language = "en" }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  {/* Add a useEffect to scroll to the bottom when messages change */ }
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage(message: string) {
    if (input.trim() === "" || isStreaming) return;
    message = message.trim();
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setIsStreaming(true);
    setInput("");
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_AI_SERVICE_URL + "/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: message }],
          language,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response body");
      }
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return [...prev.slice(0, -1), { ...lastMessage, content: lastMessage.content + chunk }];
          }
          return [...prev, { role: "assistant", content: chunk }];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {!open && (<button
          className="bg-green text-surface p-3 rounded-full shadow-lg hover:bg-green-strong focus:outline-none focus:ring focus:ring-green transition-colors flex items-center gap-2"
          onClick={() => setOpen(!open)}
        >
          <MessageSquareMore strokeWidth={2.25} />
          <span>Open AI Mentor</span>
        </button>
        )}
        {open && (
          <div className="w-80 rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <div className="mb-2 flex flex-col justify-between">
              {/* Add a header with a title and a close button */}
              <div className="flex justify-between gap-2">
                <h3 className="font-bold text-ink">AI Mentor</h3>
                <button
                  className="text-md text-ink-soft hover:text-ink transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </button>
              </div>
              {/* Add a scrollable area for messages */}
              <div className="mt-2 h-64 overflow-y-auto rounded-lg bg-cream p-2">
                <div className="flex flex-col gap-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.role === "user"
                          ? "self-end rounded-2xl rounded-br-sm bg-green px-3 py-1.5 text-surface"
                          : "self-start rounded-2xl rounded-bl-sm bg-surface-sunken px-3 py-1.5 text-ink"
                      }
                    >
                      {message.content}
                    </div>
                  ))}
                </div>
                <div ref={bottomRef} />
              </div>
              {/* Add a text input field for the user to type their message */}
              <div className="mt-2">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-lg border border-border bg-cream p-2 text-ink placeholder:text-ink-soft focus:border-green focus:ring focus:ring-green focus:ring-opacity-50"
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-green p-2 font-semibold text-surface transition-colors hover:bg-green-strong focus:outline-none focus:ring focus:ring-green disabled:cursor-not-allowed disabled:bg-ink-soft/40"
                    disabled={isStreaming || input.trim() === ""}
                  >
                    {isStreaming ? "Streaming..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
