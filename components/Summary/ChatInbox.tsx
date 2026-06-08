"use client";

import {
  Bot,
  CheckCheck,
  Clock,
  Download,
  FileText,
  Menu,
  Mic,
  MoreVertical,
  Paperclip,
  Send,
  Share2,
  Smile,
  Sparkle,
  Sparkles,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Conversation, Message } from "./Sidebar";

interface ChatInboxProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeConv: Conversation;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

const ChatInbox = ({
  sidebarOpen,
  setSidebarOpen,
  activeConv,
  messages,
  setMessages,
}: ChatInboxProps) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `m_${Date.now() + 1}`,
        sender: "ai",
        text: `Thanks for asking! Based on the uploaded PDF (**${
          activeConv.fileName
        }**), this concept is covered in detail in Section 3. I've noted down your question regarding "${newMsg.text.substring(
          0,
          30
        )}..." and I will help you master this step-by-step!`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      {/* Chat Header */}
      <div className="h-17 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Toggle Sidebar Button for all screen sizes */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors shrink-0 md:hidden"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 hidden xs:block">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white leading-tight truncate">
                {activeConv.title}
              </h1>
              <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-medium rounded-full shrink-0">
                Analyzed
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
              Source: <span className="font-mono">{activeConv.fileName}</span> •{" "}
              {activeConv.fileSize}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold">
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/80">
        {/* System Notification */}
        <div className="flex justify-center">
          <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/20 text-indigo-900 dark:text-indigo-300 text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>
              PDF loaded successfully. Initial overview & summary generated.
            </span>
          </div>
        </div>

        {messages.map((message) => {
          const isAI = message.sender === "ai";
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-[85%] ${
                isAI ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isAI
                    ? "bg-indigo-600 text-white"
                    : "bg-linear-to-tr from-emerald-500 to-teal-500 text-white"
                }`}>
                {isAI ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div
                  className={`rounded-2xl p-4 shadow-sm ${
                    isAI
                      ? "bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 text-slate-800 dark:text-slate-100"
                      : "bg-indigo-600 text-white"
                  }`}>
                  {/* Render Rich AI Summary Card if present */}
                  {isAI && message.isSummary && message.summaryData ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Bot className="w-4 h-4" /> AI Summary & Breakdown
                      </p>

                      {/* 1. Overview */}
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          📌 Document Overview
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {message.summaryData.overview}
                        </p>
                      </div>

                      {/* 2. Key Takeaways */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          🔑 Key Takeaways
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {message.summaryData.keyPoints.map((pt, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3. Core Concepts */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          💡 Core Concepts & Terminology
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {message.summaryData.concepts.map((concept, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/20 dark:border-indigo-900/10">
                              <span className="font-semibold text-xs text-indigo-700 dark:text-indigo-300 block mb-0.5">
                                {concept.title}
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {concept.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Next Steps */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          📝 Recommended Next Steps
                        </h4>
                        <ul className="list-decimal pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {message.summaryData.nextSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {message.text}
                    </p>
                  )}
                </div>

                {/* Time and Status Indicators */}
                <div
                  className={`flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 ${
                    isAI ? "" : "justify-end"
                  }`}>
                  <Clock className="w-3 h-3" />
                  <span>{message.time}</span>
                  {!isAI && (
                    <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 shrink-0 z-10">
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
              placeholder={`Ask any question about ${activeConv.fileName}...`}
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
