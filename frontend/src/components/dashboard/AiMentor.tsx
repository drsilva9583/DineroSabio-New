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
          className="bg-theme-green text-white p-3 rounded-full shadow-lg hover:bg-theme-green-dark focus:outline-none focus:ring-theme-green flex items-center gap-2"
          onClick={() => setOpen(!open)}
        >
          <MessageSquareMore strokeWidth={2.25} />
          <span>Open AI Mentor</span>
        </button>
        )}
        {open && (
          <div className="w-80 rounded-lg bg-gray-400 p-4 shadow-lg dark:bg-gray-800">
            <div className="mb-2 flex flex-col justify-between">
              {/* Add a header with a title and a close button */}
              <div className="flex justify-between gap-2">
                <h3 className="font-bold">AI Mentor</h3>
                <button
                  className="text-md text-gray-600 dark:text-gray-400"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </button>
              </div>
              {/* Add a scrollable area for messages */}
              <div className="mt-2 h-64 overflow-y-auto rounded-lg bg-gray-200 p-2 dark:bg-gray-700">
                <div>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={message.role === "user" ? "text-right" : "text-left"}
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
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-theme-green focus:ring focus:ring-theme-green focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-theme-green p-2 text-white hover:bg-theme-green-dark focus:outline-none focus:ring focus:ring-theme-green focus:ring-opacity-50 disabled:bg-gray-500 disabled:cursor-not-allowed"
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
