"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatContainer from "./chat/chat-container";
import StageSection from "./dashboard/stage-section";
import ActionCardsSection from "./dashboard/action-cards-section";
import MisalignmentAlerts from "./dashboard/misalignment-alerts";
import LibraryRecommendations from "./dashboard/library-recommendations";
import VisionSection from "./dashboard/vision-section";
import type { UIMessage } from "ai";
import type { MemberContext, AdvisorMode, InitialPath, ConversationSummary } from "@/types/advisor";

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

interface AdvisorState2Props {
  memberContext: MemberContext;
  conversationId?: string;
  initialMessages?: unknown[];
  conversations?: ConversationSummary[];
  onModeChange?: (mode: AdvisorMode) => void;
  showRoadmap?: boolean;
}

export default function AdvisorState2({
  memberContext,
  conversationId: initialConversationId,
  initialMessages: serverInitialMessages,
  conversations: serverConversations,
  onModeChange,
  showRoadmap = true,
}: AdvisorState2Props) {
  const router = useRouter();
  const [chatMode, setChatMode] = useState<AdvisorMode>("explore");
  const [selectedPath, setSelectedPath] = useState<InitialPath | null>(null);

  // List/chat view toggle
  const hasConversations = serverConversations && serverConversations.length > 0;
  const [view, setView] = useState<"list" | "chat">(
    hasConversations ? "list" : "chat"
  );

  // Active conversation state
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [chatMessages, setChatMessages] = useState<UIMessage[] | undefined>(
    serverInitialMessages as UIMessage[] | undefined
  );
  const [chatKey, setChatKey] = useState(0);
  const [loadingConvId, setLoadingConvId] = useState<string | null>(null);

  const plan = memberContext.roadmap?.plan_content as Record<string, unknown> | undefined;
  const position = plan?.position as Record<string, unknown> | undefined;
  const actions = (plan?.actions as Record<string, unknown>[]) || [];
  const vision = plan?.vision as Record<string, unknown> | undefined;
  const library = plan?.library as Record<string, unknown> | undefined;
  const misalignments = (position?.misalignments as Record<string, unknown>[]) || [];

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
      const modeMap: Record<InitialPath, AdvisorMode> = {
        deal: "evaluator",
        map: "assessment",
        explore: "explore",
      };
      setChatMode(modeMap[path]);
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

  const handleActionHelp = (actionId: string) => {
    setChatMode("action_coaching");
    onModeChange?.("action_coaching");
  };

  const handleModeChange = (mode: AdvisorMode) => {
    setChatMode(mode);
    onModeChange?.(mode);
  };

  // Shared path cards JSX
  const pathCards = (
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
  );

  return (
    <div className="adv-state-2">
      {/* AI Advisor section */}
      <div className="adv-roadmap-section">
        <div className="dash-section-head">
          <span className="dash-section-title">AI Advisor</span>
        </div>

        {view === "list" && hasConversations ? (
          <>
            {pathCards}

            <div className="inv-toolbar">
              <span className="inv-toolbar-count">
                {serverConversations!.length} conversation{serverConversations!.length !== 1 ? "s" : ""}
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
              {serverConversations!.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className="inv-card adv-conv-card"
                  onClick={() => handleLoadConversation(conv.id)}
                  disabled={loadingConvId === conv.id}
                >
                  <div className="adv-conv-card-main">
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
                  </div>
                  <span className="adv-conv-card-arrow">&rarr;</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {hasConversations && (
              <div className="adv-conv-back-row">
                <button type="button" className="btn" onClick={handleBackToList}>
                  &larr; Conversations
                </button>
              </div>
            )}

            {!selectedPath && !chatMessages && pathCards}

            <ChatContainer
              key={chatKey}
              conversationId={conversationId}
              initialMode={chatMode}
              userId={memberContext.profile.id}
              hasAssessment={true}
              initialPath={selectedPath}
              initialMessages={chatMessages}
              onModeChange={handleModeChange}
            />
          </>
        )}
      </div>

      {/* Strategic Position */}
      {showRoadmap && position && (
        <div className="adv-roadmap-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Strategic Position</span>
          </div>
          <StageSection
            stage={position.detected_stage as number}
            stageName={position.stage_name as string}
            stageDescription={position.stage_description as string}
            transitionReadiness={position.transition_readiness as string}
          />
        </div>
      )}

      {/* Three Actions */}
      {showRoadmap && actions.length > 0 && (
        <div className="adv-roadmap-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Your Three Actions</span>
          </div>
          <ActionCardsSection
            actions={actions}
            actionStatuses={memberContext.actions}
            onGetHelp={handleActionHelp}
          />
        </div>
      )}

      {/* Misalignment Alerts */}
      {showRoadmap && misalignments.length > 0 && (
        <div className="adv-roadmap-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Misalignments</span>
          </div>
          <MisalignmentAlerts misalignments={misalignments} />
        </div>
      )}

      {/* Library Recommendations */}
      {showRoadmap && library && (
        <div className="adv-roadmap-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Recommended from Library</span>
          </div>
          <LibraryRecommendations
            structures={
              (library.recommended_structures as { id: number; title: string; why: string }[]) ||
              []
            }
            cases={
              (library.recommended_cases as { slug: string; title: string; why: string }[]) ||
              []
            }
          />
        </div>
      )}

      {/* Long-Term Vision */}
      {showRoadmap && vision && (
        <div className="adv-roadmap-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Long-Term Vision</span>
          </div>
          <VisionSection
            twelveMonthTarget={vision.twelve_month_target as string}
            threeYearHorizon={vision.three_year_horizon as string}
          />
        </div>
      )}

      <div className="page-footer" />
    </div>
  );
}
