"use client";

import React, { useEffect, useState } from "react";
import Sidebar, { Conversation, Message } from "@/components/Summary/Sidebar";
import ChatInbox from "@/components/Summary/ChatInbox";

const SummaryWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load custom conversations from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedConvs = JSON.parse(
          localStorage.getItem("custom_conversations") || "[]"
        ) as Conversation[];

        const mergedConvs = [...storedConvs];

        const activeId = localStorage.getItem("active_conv_id");
        let updatedConvs: Conversation[] = [];
        let targetConv: Conversation | null = null;

        if (activeId && mergedConvs.some((c) => c.id === activeId)) {
          // Keep the active_conv_id in localStorage for persistence
          updatedConvs = mergedConvs.map((c) => ({
            ...c,
            active: c.id === activeId,
          }));
          targetConv = updatedConvs.find((c) => c.id === activeId) || null;
        } else if (mergedConvs.length > 0) {
          // If no active ID but we have conversations, select the first one
          updatedConvs = mergedConvs.map((c, idx) => ({
            ...c,
            active: idx === 0,
          }));
          targetConv = updatedConvs[0] || null;
          // Save the first conversation as active
          localStorage.setItem("active_conv_id", targetConv?.id || "");
        }
        setConversations(updatedConvs);
        setActiveConv(targetConv);

        if (targetConv) {
          if (targetConv.id.startsWith("custom_")) {
            const messagesMap = JSON.parse(
              localStorage.getItem("custom_messages_map") || "{}"
            );
            setMessages(messagesMap[targetConv.id] || []);
          } else {
            setMessages([]);
          }
        }
      } catch (e) {
        console.error("Error loading custom conversations:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist messages to localStorage whenever they change for custom conversations
  useEffect(() => {
    if (activeConv && activeConv.id && activeConv.id.startsWith("custom_")) {
      try {
        const messagesMap = JSON.parse(
          localStorage.getItem("custom_messages_map") || "{}"
        );
        messagesMap[activeConv.id] = messages;
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

    // Check if this is a custom conversation (from localStorage)
    if (conv.id.startsWith("custom_")) {
      const messagesMap = JSON.parse(
        localStorage.getItem("custom_messages_map") || "{}"
      );
      if (messagesMap[conv.id]) {
        setMessages(messagesMap[conv.id]);
      } else {
        setMessages([]);
      }
    }
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
