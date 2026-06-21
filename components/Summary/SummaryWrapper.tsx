"use client";

import { useEffect, useState } from "react";
import type { SummaryModel } from "@/prisma/generated/models/Summary";
import Sidebar, { Conversation, Message } from "@/components/Summary/Sidebar";
import ChatInbox from "@/components/Summary/ChatInbox";
import axios from "axios";

const SummaryWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load conversations from DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // const response = await fetch("/api/summarize");
        const response = await axios.get("/api/summarize");
        if (!response.data) {
          throw new Error("Failed to fetch summaries");
        }
        const data = await response.data;
        console.log(data);

        const dbConvs: Conversation[] = data.map((summary: SummaryModel) => {
          const createdDate = new Date(summary.createdAt);
          const timeStr = createdDate.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });

          return {
            id: summary.id.toString(),
            title: summary.title,
            fileName: summary.fileName,
            fileSize: summary.fileSize,
            time: timeStr,
            summaryText: summary.summaryText,
          };
        });

        const activeId = localStorage.getItem("active_conv_id");
        let updatedConvs: Conversation[] = [];
        let targetConv: Conversation | null = null;

        if (activeId && dbConvs.some((c) => c.id === activeId)) {
          updatedConvs = dbConvs.map((c) => ({
            ...c,
            active: c.id === activeId,
          }));
          targetConv = updatedConvs.find((c) => c.id === activeId) || null;
        } else if (dbConvs.length > 0) {
          updatedConvs = dbConvs.map((c, idx) => ({
            ...c,
            active: idx === 0,
          }));
          targetConv = updatedConvs[0] || null;
          localStorage.setItem("active_conv_id", targetConv?.id || "");
        }
        setConversations(updatedConvs);
        setActiveConv(targetConv);

        if (targetConv) {
          const initialMessage: Message = {
            id: `msg_summary_${targetConv.id}`,
            sender: "ai",
            text: targetConv.summaryText || "",
            time: targetConv.time,
          };

          const messagesMap = JSON.parse(
            localStorage.getItem("custom_messages_map") || "{}"
          );
          const customMsgs = messagesMap[targetConv.id] || [];
          setMessages([initialMessage, ...customMsgs]);
        }
      } catch (e) {
        console.error("Error loading custom conversations:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (activeConv && activeConv.id) {
      try {
        const messagesMap = JSON.parse(
          localStorage.getItem("custom_messages_map") || "{}"
        );
        const userFollowUps = messages.filter(
          (m) => m.id !== `msg_summary_${activeConv.id}`
        );
        messagesMap[activeConv.id] = userFollowUps;
        localStorage.setItem(
          "custom_messages_map",
          JSON.stringify(messagesMap)
        );
      } catch (e) {
        console.error("Error persisting messages:", e);
      }
    }
  }, [messages, activeConv?.id, activeConv]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial value on client mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConv = (conv: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => ({ ...c, active: c.id === conv.id }))
    );
    setActiveConv(conv);

    // Save active conversation ID to localStorage for persistence
    localStorage.setItem("active_conv_id", conv.id);

    const initialMessage: Message = {
      id: `msg_summary_${conv.id}`,
      sender: "ai",
      text: conv.summaryText || "",
      time: conv.time,
    };

    const messagesMap = JSON.parse(
      localStorage.getItem("custom_messages_map") || "{}"
    );
    const customMsgs = messagesMap[conv.id] || [];
    setMessages([initialMessage, ...customMsgs]);
  };

  return (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        conversations={conversations}
        activeConv={activeConv}
        loading={loading}
        onSelectConv={handleSelectConv}
      />

      {/* CHAT INBOX MAIN CONTAINER */}
      <ChatInbox
        loading={loading}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeConv={activeConv}
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
};

export default SummaryWrapper;
