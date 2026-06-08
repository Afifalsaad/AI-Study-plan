"use client";

import React, { useEffect, useState } from "react";
import Sidebar, { Conversation, Message } from "@/components/Summary/Sidebar";
import ChatInbox from "@/components/Summary/ChatInbox";

const initialConversations: Conversation[] = [
  {
    id: "1",
    title: "Artificial Intelligence Introduction",
    fileName: "intro_to_ai_ch1.pdf",
    fileSize: "2.4 MB",
    time: "Just now",
    active: false,
    summaryPreview: "This document provides an overview of AI history...",
  },
  {
    id: "2",
    title: "Quantum Physics Fundamentals",
    fileName: "quantum_mechanics_notes.pdf",
    fileSize: "4.8 MB",
    time: "2 hours ago",
    summaryPreview:
      "Core concepts of wave-particle duality and Schrödinger equation...",
  },
  {
    id: "3",
    title: "React Server Components Deep Dive",
    fileName: "rsc_architecture.pdf",
    fileSize: "1.2 MB",
    time: "Yesterday",
    summaryPreview:
      "Explains data fetching paradigms and server vs client component trees...",
  },
  {
    id: "4",
    title: "Introduction to Organic Chemistry",
    fileName: "organic_chem_alkanes.pdf",
    fileSize: "8.1 MB",
    time: "3 days ago",
    summaryPreview:
      "Hydrocarbon classifications, nomenclature rules and basic reactions...",
  },
];

const initialMessages: Message[] = [
  {
    id: "m1",
    sender: "ai",
    text: "Hello! I have analyzed your PDF. Here is a comprehensive summary of **intro_to_ai_ch1.pdf**:",
    time: "15:50 PM",
    isSummary: true,
    summaryData: {
      overview:
        "This chapter introduces the fundamental concepts of Artificial Intelligence, tracing its historical roots from Turing's early theoretical work to modern machine learning applications. It sets the baseline framework for defining intelligent agents and exploring rational behavior.",
      keyPoints: [
        "Definition of AI as the study of agents that receive percepts from the environment and perform actions.",
        "The Turing Test proposed in 1950 as a operational definition of intelligence.",
        "The distinction between thinking humanly, thinking rationally, acting humanly, and acting rationally.",
        "Historical milestones including the Dartmouth workshop (1956) where the term 'Artificial Intelligence' was coined.",
      ],
      concepts: [
        {
          title: "Rational Agent",
          desc: "An entity that acts so as to achieve the best outcome or, when there is uncertainty, the best expected outcome.",
        },
        {
          title: "Heuristics",
          desc: "Practical problem-solving approaches or rules of thumb that are not guaranteed to be optimal but are sufficient for immediate goals.",
        },
        {
          title: "Dartmouth Workshop (1956)",
          desc: "Widely considered the founding event of AI as a formal academic discipline, organized by John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon.",
        },
      ],
      nextSteps: [
        "Read Chapter 2 focusing on 'Intelligent Agents' structure.",
        "Try out the Turing Test simulator in the resources section.",
        "Review the mathematical formulations of rational agent decision theory.",
      ],
    },
  },
  {
    id: "m2",
    sender: "user",
    text: "Can you explain the difference between acting humanly and acting rationally? That part is a bit confusing to me.",
    time: "15:52 PM",
  },
  {
    id: "m3",
    sender: "ai",
    text: "Excellent question! Here is the breakdown:\n\n* **Acting Humanly:** This is about duplicating human behavior. The goal is to perform tasks in a way that is indistinguishable from how a human would do them (e.g., passing the Turing Test). It doesn't matter if the method is logical, as long as it mimics human performance.\n* **Acting Rationally:** This focuses on doing the **correct or optimal thing** based on what is known, regardless of whether a human would do it that way. A rational agent maximizes its performance measure. Sometimes humans act irrationally (due to emotions or cognitive limits), so acting rationally often yields better/more logical results than acting humanly.",
    time: "15:53 PM",
  },
];

const SummaryWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConv, setActiveConv] = useState<Conversation>(
    initialConversations[0]
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Load custom conversations from localStorage on mount
  useEffect(() => {
    try {
      const storedConvs = JSON.parse(
        localStorage.getItem("custom_conversations") || "[]"
      ) as Conversation[];

      if (storedConvs.length > 0) {
        // Merge: custom conversations first, then mock conversations
        const mergedConvs = [...storedConvs, ...initialConversations];

        // Check if there's an active_conv_id from a recent upload
        const activeId = localStorage.getItem("active_conv_id");
        if (activeId) {
          // Mark the newly uploaded conversation as active
          const updatedConvs = mergedConvs.map((c) => ({
            ...c,
            active: c.id === activeId,
          }));
          setConversations(updatedConvs);

          const targetConv = updatedConvs.find((c) => c.id === activeId);
          if (targetConv) {
            setActiveConv(targetConv);

            // Load its messages from localStorage
            const messagesMap = JSON.parse(
              localStorage.getItem("custom_messages_map") || "{}"
            );
            if (messagesMap[activeId]) {
              setMessages(messagesMap[activeId]);
            }
          }
          // Clear active_conv_id so it doesn't re-trigger on refresh
          localStorage.removeItem("active_conv_id");
        } else {
          // No recent upload, just merge and set first as active
          const updatedConvs = mergedConvs.map((c, idx) => ({
            ...c,
            active: idx === 0,
          }));
          setConversations(updatedConvs);
          setActiveConv(updatedConvs[0]);

          // Load messages for the first conversation
          if (updatedConvs[0].id.startsWith("custom_")) {
            const messagesMap = JSON.parse(
              localStorage.getItem("custom_messages_map") || "{}"
            );
            if (messagesMap[updatedConvs[0].id]) {
              setMessages(messagesMap[updatedConvs[0].id]);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error loading custom conversations:", e);
    }
  }, []);

  // Persist messages to localStorage whenever they change for custom conversations
  useEffect(() => {
    if (activeConv.id.startsWith("custom_")) {
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
  }, [messages, activeConv.id]);

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
    } else if (conv.id === "1") {
      // Mock conversation 1
      setMessages(initialMessages);
    } else {
      // Other mock conversations
      setMessages([
        {
          id: "m_other_1",
          sender: "ai",
          text: `Here is the AI generated summary for **${conv.fileName}** (${conv.fileSize}).`,
          time: "10:30 AM",
          isSummary: true,
          summaryData: {
            overview: `This is a synthesized summary preview of your document "${conv.title}". The AI has processed all key chapters and index systems to build a modular summary map.`,
            keyPoints: [
              "Core theme analysis and introduction to chapter objectives.",
              "Key arguments, diagrams, and formulas present in the text.",
              "Important takeaways ready for exam preparation.",
            ],
            concepts: [
              {
                title: "Theoretical Framework",
                desc: "The primary structure containing all definitions, variables, and logic matrices analyzed in the study material.",
              },
            ],
            nextSteps: [
              "Review the generated flashcards for this material.",
              "Generate a mock quiz on the topics covered.",
            ],
          },
        },
      ]);
    }
  };
  return (
    <>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        conversations={conversations}
        activeConv={activeConv}
        onSelectConv={handleSelectConv}
      />

      {/* CHAT INBOX MAIN CONTAINER */}
      <ChatInbox
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

