"use client";

import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import ChatProgressBar from "./chat-progress-bar";
import AssessmentFlow from "./assessment-flow";
import type { AdvisorMode, InitialPath, ConversationContextSnapshot } from "@/types/advisor";

const PATH_TO_MODE: Record<InitialPath, AdvisorMode> = {
  deal: "evaluator",
  map: "assessment",
  explore: "explore",
};

// Client tools (no `execute`) — these render UI components that require user interaction.
// Only these should trigger auto-resubmit after the user provides a tool result.
const CLIENT_TOOL_NAMES = new Set([
  "show_option_cards",
  "show_multi_select",
  "show_ranking",
  "show_allocation_sliders",
  "show_slider",
  "show_currency_input",
  "show_free_text",
  "show_action_cards",
  "show_roadmap_summary",
]);

// Display-only visual tools — server-executed but rendered from input args in the UI
const DISPLAY_TOOL_NAMES = new Set([
  "show_bar_chart",
  "show_entity_chart",
  "show_metrics",
  "show_data_table",
  "show_radar_chart",
  "show_flywheel",
]);

interface ChatContainerProps {
  conversationId?: string;
  initialMode?: AdvisorMode;
  userId: string;
  hasAssessment: boolean;
  initialPath?: InitialPath | null;
  initialPrompt?: string | null;
  initialMessages?: UIMessage[];
  onModeChange?: (mode: AdvisorMode) => void;
  onAssessmentComplete?: () => void;
  className?: string;
  compact?: boolean; // For embedded panel in State 2
}

function getWelcomeMessage(hasAssessment: boolean): UIMessage {
  return {
    id: "welcome",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: hasAssessment
          ? "Welcome back. I\u2019m your strategic advisor \u2014 built on research into how the creative economy is restructuring and what creative professionals can do about it.\n\nWhat would you like to work on?"
          : "Welcome to In Sequence. I\u2019m your strategic advisor \u2014 built on research into how the creative economy is restructuring and what creative professionals can do about it.\n\nChoose a path above, or type a question to get started.",
      },
    ],
  };
}

export default function ChatContainer({
  conversationId: initialConversationId,
  initialMode = "explore",
  userId,
  hasAssessment,
  initialPath,
  initialPrompt,
  initialMessages,
  onModeChange,
  onAssessmentComplete,
  className = "",
  compact = false,
}: ChatContainerProps) {
  // Assessment mode uses a client-side state machine (no AI calls during data collection)
  if (initialPath === "map") {
    return (
      <AssessmentFlow
        userId={userId}
        onComplete={onAssessmentComplete}
        className={`${compact ? "compact" : ""} ${className}`}
      />
    );
  }

  return (
    <AIChatFlow
      conversationId={initialConversationId}
      initialMode={initialMode}
      userId={userId}
      hasAssessment={hasAssessment}
      initialPath={initialPath}
      initialPrompt={initialPrompt}
      initialMessages={initialMessages}
      onModeChange={onModeChange}
      onAssessmentComplete={onAssessmentComplete}
      className={className}
      compact={compact}
    />
  );
}

function AIChatFlow({
  conversationId: initialConversationId,
  initialMode = "explore",
  userId,
  hasAssessment,
  initialPath,
  initialPrompt,
  initialMessages,
  onModeChange,
  className = "",
  compact = false,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<AdvisorMode>(initialMode);
  const [snapshot, setSnapshot] = useState<ConversationContextSnapshot>({
    mode: initialMode,
  });
  const [conversationId, setConversationId] = useState(initialConversationId);
  const pathSentRef = useRef(false);

  // Use refs for values that must be current at request time (not stale from closure)
  const modeRef = useRef<AdvisorMode>(initialMode);
  const snapshotRef = useRef<ConversationContextSnapshot>({ mode: initialMode });
  const conversationIdRef = useRef(initialConversationId);

  // Track last saved message count to avoid redundant saves
  const lastSavedCountRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  // Determine starting messages: restored from DB or fresh welcome
  const startingMessages = useMemo(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Mark the saved count so we don't re-save on mount
      lastSavedCountRef.current = initialMessages.length;
      return initialMessages;
    }
    return [getWelcomeMessage(hasAssessment)];
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Custom fetch to intercept X-Conversation-Id header from response
  const customFetch = useCallback(async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, init);
    const newConvId = response.headers.get("X-Conversation-Id");
    if (newConvId && newConvId !== conversationIdRef.current) {
      conversationIdRef.current = newConvId;
      setConversationId(newConvId);
    }
    return response;
  }, []);

  // Use prepareSendMessagesRequest so the mode/snapshot are always current at request time
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/advisor/chat",
        fetch: customFetch,
        prepareSendMessagesRequest: ({ messages: msgs, body: base, headers, credentials, api }) => ({
          body: {
            ...base,
            messages: msgs,
            data: {
              conversationId: conversationIdRef.current,
              mode: modeRef.current,
              snapshot: snapshotRef.current,
            },
          },
          headers,
          credentials,
          api,
        }),
      }),
    [customFetch]
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    addToolResult,
  } = useChat({
    transport,
    messages: startingMessages,
    // Auto-resubmit when a CLIENT tool receives its result (user interacted with UI component).
    // Server tools are handled within a single API call via stepCountIs(10) — no resubmit needed.
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      const last = msgs[msgs.length - 1];
      if (last?.role !== "assistant") return false;
      // Check if any CLIENT tool just got its output (user responded to a UI component)
      const hasClientToolOutput = last.parts.some(
        (p) =>
          isToolUIPart(p) &&
          p.state === "output-available" &&
          CLIENT_TOOL_NAMES.has(p.type.replace("tool-", ""))
      );
      // Only resubmit if there's no pending client tool still awaiting input
      const hasPendingClientTool = last.parts.some(
        (p) =>
          isToolUIPart(p) &&
          (p.state === "input-available" || p.state === "input-streaming") &&
          CLIENT_TOOL_NAMES.has(p.type.replace("tool-", ""))
      );
      return hasClientToolOutput && !hasPendingClientTool;
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const hasError = status === "error" || !!error;

  // ── Client-side message persistence ──────────────────────────
  // Save messages to DB when an exchange completes (status becomes "ready")
  useEffect(() => {
    if (status !== "ready") return;
    if (!conversationIdRef.current) return;
    if (messages.length <= 1) return; // Don't save just the welcome message
    if (messages.length === lastSavedCountRef.current) return; // Already saved this state

    lastSavedCountRef.current = messages.length;

    // Fire-and-forget save
    fetch("/api/advisor/conversations/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversationIdRef.current,
        messages,
        mode: modeRef.current,
      }),
    }).catch((err) => console.error("Failed to save conversation:", err));
  }, [status, messages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send initial message when a path card is selected above the chat
  useEffect(() => {
    if (!initialPath || pathSentRef.current) return;
    pathSentRef.current = true;

    // Update mode synchronously via ref before sending
    const newMode = PATH_TO_MODE[initialPath];
    modeRef.current = newMode;
    setMode(newMode);

    const messageMap: Record<InitialPath, string> = {
      deal: "I have a deal to evaluate",
      map: "Map my position",
      explore: "I\u2019m just exploring",
    };

    sendMessage({ text: messageMap[initialPath] });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPath]);

  // Send initial prompt from URL query param (e.g. from roadmap AI Assist)
  const promptSentRef = useRef(false);
  useEffect(() => {
    if (!initialPrompt || promptSentRef.current || pathSentRef.current) return;
    promptSentRef.current = true;

    // Use action_coaching mode for roadmap AI Assist prompts
    modeRef.current = "action_coaching";
    setMode("action_coaching" as AdvisorMode);

    sendMessage({ text: initialPrompt });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Handle tool results from structured components
  const handleToolResult = useCallback(
    (toolCallId: string, toolName: string, result: unknown) => {
      addToolResult({ toolCallId, tool: toolName, output: result });
    },
    [addToolResult]
  );

  // Handle free text message submission
  const handleSubmit = useCallback(
    (message: string) => {
      sendMessage({ text: message });
    },
    [sendMessage]
  );

  return (
    <div className={`adv-chat-container ${compact ? "compact" : ""} ${className}`}>
      {/* Progress bar (assessment/evaluator mode) */}
      {(mode === "assessment" || mode === "evaluator") &&
        snapshot?.currentSection && (
          <ChatProgressBar
            currentSection={snapshot.currentSection}
            totalSections={5}
          />
        )}

      {/* Messages */}
      <div className="adv-chat-messages" ref={scrollRef}>
        {messages.map((message, idx) => (
          <ChatMessage
            key={message.id}
            message={message}
            isComplete={!(isLoading && idx === messages.length - 1 && message.role === "assistant")}
            onToolResult={(toolCallId, toolName, result) => handleToolResult(toolCallId, toolName, result)}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="adv-chat-message assistant">
            <div className="adv-chat-avatar">
              <span className="adv-chat-avatar-icon">IS</span>
            </div>
            <div className="adv-chat-message-content">
              <div className="adv-chat-typing">
                <span className="adv-chat-typing-dot" />
                <span className="adv-chat-typing-dot" />
                <span className="adv-chat-typing-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <div className="adv-chat-message assistant">
            <div className="adv-chat-avatar">
              <span className="adv-chat-avatar-icon">IS</span>
            </div>
            <div className="adv-chat-message-content">
              <div className="adv-chat-error">
                <p>Something went wrong. {error?.message ? `Error: ${error.message}` : "The response may have timed out."}</p>
                <button
                  type="button"
                  className="adv-chat-retry-btn"
                  onClick={() => sendMessage({ text: "Continue where you left off." })}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={
          mode === "assessment"
            ? "Or type your answer..."
            : "Type a message..."
        }
      />
    </div>
  );
}
