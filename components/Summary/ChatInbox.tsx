"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@/components/ui/message";
import {
  Bot,
  CheckCheck,
  Clock,
  Download,
  Menu,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Share2,
  Smile,
  Sparkles,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Conversation, Messages } from "./Sidebar";
import Skeleton from "../Skeleton";
import { useSession } from "next-auth/react";

interface ChatInboxProps {
  sidebarOpen: boolean;
  loading: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeConv: Conversation | null;
  messages: Messages[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatInbox = ({
  sidebarOpen,
  setSidebarOpen,
  activeConv,
  messages,
  setMessages,
  loading,
}: ChatInboxProps) => {
  // console.log(messages);
  const session = useSession();
  const userImg = session?.data?.user?.image;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender: "user",
      text: inputText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative transition-all">
      {/* Chat Header */}
      <div className="h-17 px-4 sm:px-6 border-b  dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0 ">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Toggle Sidebar Button for all screen sizes */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors shrink-0 md:hidden"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 hidden xs:block">
            {/* <FileText className="w-5 h-5" /> */}
          </div>
          {loading ? (
            <Skeleton></Skeleton>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white leading-tight truncate">
                  {activeConv?.title || "No conversation selected"}
                </h1>
                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-medium rounded-full shrink-0">
                  Analyzed
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Source:{" "}
                <span className="font-mono">
                  {activeConv?.fileName || "N/A"}
                </span>{" "}
                • {activeConv?.fileSize || ""}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="p-2 hover:bg-slate-100 hover:cursor-pointer dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export Summary</span>
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      {loading ? (
        <div className="flex-1"></div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/80 ">
          {/* System Notification */}
          {messages.length == 0 ? (
            <div className="flex justify-center">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/20 text-indigo-900 dark:text-indigo-300 text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>No PDF uploaded. Upload a PDF for get summary.</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/20 text-indigo-900 dark:text-indigo-300 text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>
                  PDF loaded successfully. Initial overview & summary generated.
                </span>
              </div>
            </div>
          )}

          {(() => {
            const groups: { sender: string; messages: Messages[] }[] = [];
            messages.forEach((msg) => {
              const lastGroup = groups[groups.length - 1];
              if (lastGroup && lastGroup.sender === msg.sender) {
                lastGroup.messages.push(msg);
              } else {
                groups.push({
                  sender: msg.sender,
                  messages: [msg],
                });
              }
            });

            return groups.map((group, groupIdx) => {
              const isAI = group.sender === "ai";
              return (
                <div key={groupIdx} className="flex w-full flex-col">
                  <Message className="w-full" align={isAI ? "start" : "end"}>
                    <MessageAvatar
                      className={isAI ? "bg-transparent border-none" : ""}>
                      <Avatar className="">
                        {isAI ? (
                          <AvatarImage src={"/bot.png"} alt="@avatar" />
                        ) : (
                          <AvatarImage
                            src={userImg || "/user.png"}
                            alt="@avatar"
                          />
                        )}
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <MessageGroup>
                        {group.messages.map((message) => (
                          <Bubble
                            key={message.id}
                            className={cn(
                              "*:data-[slot=bubble-content]:rounded-3xl!",
                              !isAI &&
                                "*:data-[slot=bubble-content]:bg-blue-100!"
                            )}
                            variant="outline"
                            align={isAI ? "start" : "end"}>
                            <BubbleContent className="w-full">
                              {message.text}
                            </BubbleContent>
                          </Bubble>
                        ))}
                      </MessageGroup>
                    </MessageContent>
                  </Message>
                </div>
              );
            });
          })()}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* BOTTOM INPUT BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 shrink-0 z-10 ">
        <form onSubmit={handleSendMessage} className=" flex items-center gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            title="Add attachment">
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Input Box */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-800/70 rounded-xl flex items-center px-3 border border-transparent focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask any question about ${
                activeConv?.fileName || "the document"
              }...`}
              className="flex-1 bg-transparent py-3 text-sm focus:outline-hidden outline-hidden border-0 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-550"
            />
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-all shrink-0 flex items-center justify-center ${
              inputText.trim()
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}>
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </main>
  );
};

export default ChatInbox;
