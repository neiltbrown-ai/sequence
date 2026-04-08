"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatContainer from "./chat/chat-container";
import type { UIMessage } from "ai";
import type { MemberContext, AdvisorMode, InitialPath, ConversationSummary } from "@/types/advisor";

function DealIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

const MODE_LABELS: Record<string, string> = {
  explore: "Explore",
  evaluator: "Deal Eval",
  assessment: "Assessment",
  negotiation: "Negotiation",
  library: "Library",
  action_coaching: "Action",
};

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const PAGE_SIZE = 10;

interface AdvisorState1Props {
  memberContext: MemberContext;
  conversationId?: string;
  initialMessages?: unknown[];
  conversations?: ConversationSummary[];
  onModeChange?: (mode: AdvisorMode) => void;
  onAssessmentComplete?: () => void;
}

export default function AdvisorState1({
  memberContext,
  conversationId: initialConversationId,
  initialMessages: serverInitialMessages,
  conversations: serverConversations,
  onModeChange,
  onAssessmentComplete,
}: AdvisorState1Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAssessment = memberContext.assessment?.status === "completed";

  // Check for ?prompt= query param (e.g. from roadmap AI Assist links)
  const queryPrompt = searchParams.get("prompt");

  // View state: "list" shows conversation history, "chat" shows the active chat
  const hasConversations = serverConversations && serverConversations.length > 0;
  const [view, setView] = useState<"list" | "chat">(
    queryPrompt ? "chat" : hasConversations ? "list" : "chat"
  );

  // Local conversations state (initialized from server, mutated on rename/delete)
  const [conversations, setConversations] = useState(serverConversations || []);

  // Active conversation state
  const [conversationId, setConversationId] = useState(
    queryPrompt ? undefined : initialConversationId
  );
  const [chatMessages, setChatMessages] = useState<UIMessage[] | undefined>(
    queryPrompt ? undefined : (serverInitialMessages as UIMessage[] | undefined)
  );
  const [chatKey, setChatKey] = useState(0); // Key to force remount ChatContainer

  const [selectedPath, setSelectedPath] = useState<InitialPath | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(queryPrompt);
  const [loadingConvId, setLoadingConvId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const handlePathSelect = useCallback(
    (path: InitialPath) => {
      if (path === "map") {
        router.push("/assessment");
        return;
      }
      if (path === "deal") {
        router.push("/evaluate");
        return;
      }
      setSelectedPath(path);
      setChatKey((k) => k + 1);
      setConversationId(undefined);
      setChatMessages(undefined);
      setView("chat");
      const modeMap: Record<InitialPath, AdvisorMode> = {
        deal: "evaluator",
        map: "assessment",
        explore: "explore",
      };
      onModeChange?.(modeMap[path]);
    },
    [onModeChange, router]
  );

  // Load a past conversation and switch to chat view
  const handleLoadConversation = useCallback(async (convId: string) => {
    setLoadingConvId(convId);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("ai_conversations")
        .select("id, messages, current_mode")
        .eq("id", convId)
        .single();

      if (data) {
        setConversationId(data.id);
        setChatMessages((data.messages as UIMessage[]) || undefined);
        setChatKey((k) => k + 1);
        setSelectedPath(null);
        setView("chat");
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoadingConvId(null);
    }
  }, []);

  // Start a new conversation
  const handleNewConversation = useCallback(() => {
    setConversationId(undefined);
    setChatMessages(undefined);
    setChatKey((k) => k + 1);
    setSelectedPath(null);
    setView("chat");
  }, []);

  // Go back to list
  const handleBackToList = useCallback(() => {
    setView("list");
  }, []);

  // ── List View ────────────────────────────────────────────
  if (view === "list" && hasConversations) {
    const totalConversations = conversations.length;
    const visibleConversations = conversations.slice(0, visibleCount);
    const hasMore = visibleCount < totalConversations;

    return (
      <div className="adv-state-1">
        <div className="page-header">
          <h1 className="page-title">AI Advisor</h1>
        </div>

        {/* Path cards */}
        <div className="adv-path-cards">
          <button type="button" className="adv-path-card" onClick={() => handlePathSelect("deal")}>
            <span className="adv-path-card-icon"><DealIcon /></span>
            <h3 className="adv-path-card-title">Evaluate a deal</h3>
            <p className="adv-path-card-desc">Get clarity on a specific offer or opportunity.</p>
          </button>
          <button type="button" className="adv-path-card" onClick={() => handlePathSelect("map")}>
            <span className="adv-path-card-icon"><MapIcon /></span>
            <h3 className="adv-path-card-title">Map my position</h3>
            <p className="adv-path-card-desc">Understand where you stand and what to do next.</p>
          </button>
          <button type="button" className="adv-path-card" onClick={() => handlePathSelect("explore")}>
            <span className="adv-path-card-icon"><ExploreIcon /></span>
            <h3 className="adv-path-card-title">Just exploring</h3>
            <p className="adv-path-card-desc">Browse the framework, ask questions, see what&apos;s possible.</p>
          </button>
        </div>

        {/* Two-column: conversation history + CTA */}
        <div className="adv-list-layout">
          <div style={{ minWidth: 0 }}>
            <div className="adv-conv-toolbar">
              <span className="page-count">
                {totalConversations} conversation{totalConversations !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                className="btn btn--filled"
                onClick={handleNewConversation}
              >
                New Conversation
              </button>
            </div>

            <div className="adv-conv-list">
              {visibleConversations.map((conv) => (
                <div key={conv.id} className="inv-card adv-conv-card">
                  <button
                    type="button"
                    className="adv-conv-card-main"
                    style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1, padding: 0 }}
                    onClick={() => handleLoadConversation(conv.id)}
                    disabled={loadingConvId === conv.id}
                  >
                    <span className="adv-conv-card-title">
                      {conv.title || "Untitled conversation"}
                    </span>
                    <div className="adv-conv-card-meta">
                      <span className="inv-badge">
                        {MODE_LABELS[conv.current_mode] || conv.current_mode}
                      </span>
                      <span className="adv-conv-card-count">
                        {conv.message_count} message{conv.message_count !== 1 ? "s" : ""}
                      </span>
                      <span className="adv-conv-card-date">
                        {formatRelativeDate(conv.last_message_at || conv.started_at)}
                      </span>
                    </div>
                  </button>
                  <div className="adv-conv-card-actions" style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <button
                      type="button"
                      title="Rename"
                      className="adv-conv-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTitle = prompt("Rename conversation:", conv.title || "");
                        if (newTitle !== null && newTitle.trim()) {
                          fetch("/api/advisor/conversations", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ conversationId: conv.id, title: newTitle.trim() }),
                          }).then(() => {
                            setConversations((prev) =>
                              prev.map((c) => c.id === conv.id ? { ...c, title: newTitle.trim() } : c)
                            );
                          });
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className="adv-conv-action-btn adv-conv-action-btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this conversation? This cannot be undone.")) {
                          fetch(`/api/advisor/conversations?id=${conv.id}`, {
                            method: "DELETE",
                          }).then(() => {
                            setConversations((prev) => prev.filter((c) => c.id !== conv.id));
                          });
                        }
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                className="btn"
                style={{ width: "100%", marginTop: 8, textAlign: "center" }}
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              >
                Load more conversations
              </button>
            )}
          </div>

          {/* 1:1 Coaching CTA */}
          <div style={{ position: "sticky", top: 24 }}>
            <div className="adv-roadmap-cta">
              <div className="adv-roadmap-cta-label">[Advisory]</div>
              <div className="adv-roadmap-cta-title">1:1 Coaching</div>
              <p className="adv-roadmap-cta-desc">
                Stop leaving money on the table. Get a strategist in your corner
                who understands how creative careers actually work.
              </p>
              <ul className="adv-roadmap-cta-list">
                {[
                  "Dedicated strategic advisor",
                  "Custom deal structure analysis",
                  "Negotiation preparation",
                  "Career positioning",
                ].map((item) => (
                  <li key={item} className="adv-roadmap-cta-list-item">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={10} height={10}>
                      <rect x="2" y="2" width="12" height="12" rx="1" />
                      <polyline points="5 8 7 10.5 11 5.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/contact" className="adv-roadmap-cta-btn">
                Join Waitlist
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat View ────────────────────────────────────────────
  return (
    <div className="adv-state-1 adv-state-1--chat">
      {/* Chat window — full height under topbar */}
      <ChatContainer
        key={chatKey}
        conversationId={conversationId}
        userId={memberContext.profile.id}
        hasAssessment={hasAssessment}
        initialPath={selectedPath}
        initialPrompt={initialPrompt}
        initialMessages={chatMessages}
        onModeChange={onModeChange}
        onAssessmentComplete={onAssessmentComplete}
      />

      {/* Conversations link below chat */}
      {hasConversations && (
        <div className="adv-chat-back">
          <a href="#" onClick={(e) => { e.preventDefault(); handleBackToList(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Conversations
          </a>
        </div>
      )}
    </div>
  );
}
