"use client";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";

export interface Conversation {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  time: string;
  active?: boolean;
  unread?: boolean;
  summaryPreview: string;
}

export interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  isSummary?: boolean;
  summaryData?: {
    overview: string;
    keyPoints: string[];
    concepts: { title: string; desc: string }[];
    nextSteps: string[];
  };
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  conversations: Conversation[];
  activeConv: Conversation;
  onSelectConv: (conv: Conversation) => void;
}

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  conversations,
  onSelectConv,
}: SidebarProps) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static top-16 bottom-0 left-0 border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300 z-50 shrink-0 ${
          sidebarOpen
            ? "translate-x-0 w-72 sm:w-80 border-r opacity-100"
            : "-translate-x-full md:translate-x-0 md:w-20 md:border-r"
        }`}>
        {/* Sidebar Header */}
        <div
          className={`p-4  flex items-center ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  Study Chats
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  title="Close sidebar">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div
              className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              title="Expand Sidebar">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Search Bar */}
        {sidebarOpen && (
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chat or document..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-sm border-0 focus:ring-2 focus:ring-indigo-500/50 outline-hidden transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-2 p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                onSelectConv(conv);
                // Auto close sidebar on mobile after choosing a conversation
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
              className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 group relative ${
                sidebarOpen ? "justify-start" : "justify-center"
              } ${
                conv.active
                  ? "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30"
                  : "hover:bg-slate-100/70 dark:hover:bg-slate-800/40 border border-transparent"
              }`}
              title={!sidebarOpen ? conv.title : undefined}>
              <div
                className={`p-2.5 rounded-lg shrink-0 ${
                  conv.active
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                } transition-colors`}>
                <FileText className="w-5 h-5" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3
                      className={`font-semibold text-sm truncate ${
                        conv.active
                          ? "text-indigo-950 dark:text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                      {conv.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-1">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-1">
                    {conv.fileName} ({conv.fileSize})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1">
                    {conv.summaryPreview}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div
          className={`p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 flex items-center ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              U
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active User
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Free Tier
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Link href="/">
              <button className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
