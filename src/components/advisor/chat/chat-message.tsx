"use client";

import { useState, useCallback } from "react";
import { type UIMessage, type UIMessagePart, isToolUIPart, getToolName } from "ai";
import { resolveStructureSlug, getStructureNumber } from "@/lib/structure-slugs";
import ChatOptionCards from "@/components/advisor/components/option-cards";
import ChatMultiSelect from "@/components/advisor/components/multi-select-cards";
import ChatRankingWidget from "@/components/advisor/components/ranking-widget";
import ChatAllocationSliders from "@/components/advisor/components/allocation-sliders";
import ChatSliderInput from "@/components/advisor/components/slider-input";
import ChatCurrencyInput from "@/components/advisor/components/currency-input";
import ChatFreeTextInline from "@/components/advisor/components/free-text-inline";
import ChatActionCards from "@/components/advisor/components/action-cards-display";
import ChatRoadmapSummary from "@/components/advisor/components/roadmap-summary";
import CollapsedResponse from "@/components/advisor/components/collapsed-response";
import { ChatBarChart } from "@/components/advisor/components/chat-bar-chart";
import { ChatEntityChart } from "@/components/advisor/components/chat-entity-chart";
import { ChatMetrics } from "@/components/advisor/components/chat-metrics";
import { ChatDataTable } from "@/components/advisor/components/chat-data-table";
import { ChatRadarChart } from "@/components/advisor/components/chat-radar-chart";
import { ChatFlywheel } from "@/components/advisor/components/chat-flywheel";

const DISPLAY_TOOLS = new Set([
  "show_bar_chart", "show_entity_chart", "show_metrics",
  "show_data_table", "show_radar_chart", "show_flywheel",
]);

interface ChatMessageProps {
  message: UIMessage;
  isComplete?: boolean;
  onToolResult?: (toolCallId: string, toolName: string, result: unknown) => void;
}

/** Extract plain text from all text parts of a message */
function getMessageText(parts: UIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && "text" in p)
    .map((p) => p.text)
    .join("\n\n");
}

function MessageActions({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advisor-response.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  return (
    <div className="adv-chat-actions">
      <button type="button" className="adv-chat-action-btn" onClick={handleCopy} title={copied ? "Copied" : "Copy to clipboard"}>
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
      <button type="button" className="adv-chat-action-btn" onClick={handleDownload} title="Download as text file">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
      </button>
    </div>
  );
}

/** Detect if text looks like a structured document (headings, lists, separators, long structured content) */
function isDocumentLike(text: string): boolean {
  const hasHeadings = /^#{1,3}\s/m.test(text);
  const hasHorizontalRule = /^[-*]{3,}\s*$/m.test(text);
  const hasBulletList = (text.match(/^[-*]\s+/gm) || []).length >= 3;
  const hasNumberedList = (text.match(/^\d+\.\s+/gm) || []).length >= 3;
  // Document if it has headings + lists, or horizontal rules, or is very long with structure
  return hasHeadings || hasHorizontalRule || (text.length > 500 && (hasBulletList || hasNumberedList));
}

export default function ChatMessage({
  message,
  isComplete = true,
  onToolResult,
}: ChatMessageProps) {
  const { role, parts } = message;

  // Only show copy/download on completed assistant messages with document-like content
  const messageText = role === "assistant" ? getMessageText(parts) : "";
  const showActions = isComplete && role === "assistant" && isDocumentLike(messageText);

  return (
    <div className={`adv-chat-message ${role}`}>
      {role === "assistant" && (
        <div className="adv-chat-avatar">
          <span className="adv-chat-avatar-icon">IS</span>
        </div>
      )}
      <div className="adv-chat-message-content">
        {parts.map((part, idx) => {
          if (part.type === "text" && part.text) {
            // Bold the last paragraph only when the next visible part is a CLIENT tool (show_*)
            const nextClientTool = findNextClientTool(parts, idx);

            return (
              <div key={idx} className="adv-chat-message-text">
                {renderMarkdown(part.text, nextClientTool)}
              </div>
            );
          }

          // Tool parts (both static and dynamic)
          if (isToolUIPart(part)) {
            const name = getToolName(part);
            const toolCallId = part.toolCallId;

            return (
              <div key={toolCallId || idx} className="adv-chat-tool">
                {renderToolPart(name, part, onToolResult)}
              </div>
            );
          }

          return null;
        })}
        {showActions && <MessageActions text={messageText} />}
      </div>
    </div>
  );
}


function StructureRefCard({ slug, label }: { slug: string; label: string }) {
  const cleanSlug = resolveStructureSlug(slug);
  const num = getStructureNumber(cleanSlug);
  // Strip redundant "Structure #NN:" or "Structure #NN —" prefix from label
  const cleanLabel = label.replace(/^Structure\s*#\d+\s*[:\u2014\u2013\-]\s*/i, "");
  return (
    <a href={`/library/structures/${cleanSlug}`} className="adv-chat-ref-card">
      {num > 0 && <span className="adv-chat-ref-num">#{num}</span>}
      <span className="adv-chat-ref-label">{cleanLabel}</span>
      <span className="adv-chat-ref-arrow">&rarr;</span>
    </a>
  );
}

function CaseStudyRefCard({ name, slug }: { name: string; slug: string }) {
  return (
    <a href={`/library/case-studies/${slug}`} className="adv-chat-ref-card">
      <span className="adv-chat-ref-label">{name}</span>
      <span className="adv-chat-ref-arrow">&rarr;</span>
    </a>
  );
}

/** Parse inline markdown: [links](url), **bold**, *italic* */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match: [link](url), **bold**, *italic*
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] && match[3]) {
      // [link text](url) — check if it's a library link
      const url = match[3];
      if (url.startsWith("/library/structures/")) {
        const slug = url.replace("/library/structures/", "");
        nodes.push(<StructureRefCard key={match.index} slug={slug} label={match[2]} />);
      } else if (url.startsWith("/library/case-studies/")) {
        const slug = url.replace("/library/case-studies/", "");
        nodes.push(<CaseStudyRefCard key={match.index} name={match[2]} slug={slug} />);
      } else {
        nodes.push(
          <a key={match.index} href={url} className="adv-chat-link">{match[2]}</a>
        );
      }
    } else if (match[4]) {
      // **bold**
      nodes.push(<strong key={match.index}>{match[4]}</strong>);
    } else if (match[5]) {
      // *italic*
      nodes.push(<em key={match.index}>{match[5]}</em>);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

// Detect if a line starts with a markdown link to a library page
const LIBRARY_LINK_RE = /^\[([^\]]+)\]\((\/library\/(?:structures|case-studies)\/[^)]+)\)/;

function renderMarkdown(text: string, boldLastLine: boolean): React.ReactNode[] {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: { num: string; text: string }[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    // Separate library-link bullets (render as ref blocks) from plain bullets
    const plainBullets: string[] = [];
    for (const item of bulletBuffer) {
      if (LIBRARY_LINK_RE.test(item)) {
        // Flush any accumulated plain bullets first
        if (plainBullets.length > 0) {
          elements.push(
            <ul key={`ul-${elements.length}`} className="adv-chat-list">
              {plainBullets.map((b, i) => (
                <li key={i}>{renderInline(b)}</li>
              ))}
            </ul>
          );
          plainBullets.length = 0;
        }
        // Render as block-level ref card with trailing description
        elements.push(
          <div key={`ref-${elements.length}`} className="adv-chat-ref-block">
            {renderInline(item)}
          </div>
        );
      } else {
        plainBullets.push(item);
      }
    }
    if (plainBullets.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="adv-chat-list">
          {plainBullets.map((b, i) => (
            <li key={i}>{renderInline(b)}</li>
          ))}
        </ul>
      );
    }
    bulletBuffer = [];
  };

  const flushNumbered = () => {
    if (numberedBuffer.length === 0) return;
    elements.push(
      <ol key={`ol-${elements.length}`} className="adv-chat-list adv-chat-list--ordered">
        {numberedBuffer.map((item, i) => (
          <li key={i} value={parseInt(item.num)}>{renderInline(item.text)}</li>
        ))}
      </ol>
    );
    numberedBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings: ### H3, ## H2, # H1
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushBullets();
      flushNumbered();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      if (level === 1) {
        elements.push(<h3 key={i} className="adv-chat-heading adv-chat-h1">{renderInline(headingText)}</h3>);
      } else if (level === 2) {
        elements.push(<h4 key={i} className="adv-chat-heading adv-chat-h2">{renderInline(headingText)}</h4>);
      } else {
        elements.push(<h5 key={i} className="adv-chat-heading adv-chat-h3">{renderInline(headingText)}</h5>);
      }
      continue;
    }

    // Horizontal rules: --- or ***
    if (/^[-*]{3,}\s*$/.test(line)) {
      flushBullets();
      flushNumbered();
      elements.push(<hr key={i} className="adv-chat-hr" />);
      continue;
    }

    // Numbered list items: 1. text, 2. text
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      flushBullets();
      numberedBuffer.push({ num: numberedMatch[1], text: numberedMatch[2] });
      continue;
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      flushNumbered();
      bulletBuffer.push(bulletMatch[1]);
      continue;
    }

    flushBullets();
    flushNumbered();

    // Merge "— description" lines into the preceding ref block
    const lastEl = elements[elements.length - 1] as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
    if (
      line.match(/^[—–\-]\s/) &&
      lastEl?.props?.className === "adv-chat-ref-block"
    ) {
      elements[elements.length - 1] = (
        <div key={lastEl.key} className="adv-chat-ref-block">
          {lastEl.props.children}
          <span className="adv-chat-ref-desc"> {line}</span>
        </div>
      );
      continue;
    }

    const isLastLine = i === lines.length - 1;
    // Bold the closing question: when a client tool follows, or when the last line ends with "?"
    const shouldBoldLast = isLastLine && (boldLastLine || line.trim().endsWith("?"));
    if (shouldBoldLast) {
      elements.push(
        <p key={i} className="adv-chat-question-text">
          {renderInline(line)}
        </p>
      );
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>);
    }
  }

  flushBullets();
  flushNumbered();
  return elements;
}

function renderToolPart(
  toolName: string,
  part: Extract<UIMessagePart<any, any>, { toolCallId: string }>,
  onToolResult?: (toolCallId: string, toolName: string, result: unknown) => void
) {
  const { toolCallId } = part;

  // If we already have output, show collapsed version (or persist visual for display tools)
  if (part.state === "output-available") {
    // Display-only visual tools persist their visual — render from input args
    if (DISPLAY_TOOLS.has(toolName)) {
      return renderDisplayTool(toolName, (part.input || {}) as Record<string, unknown>);
    }
    return renderCollapsedResult(toolName, part.output);
  }

  // If the tool has input available, render it
  if (part.state === "input-available" || part.state === "input-streaming") {
    const args = part.input || {};

    // Display tools are server-executed but render visuals from their input args
    if (DISPLAY_TOOLS.has(toolName)) {
      return renderDisplayTool(toolName, args as Record<string, unknown>);
    }

    // Check if this is a server-side tool (those have no UI rendering)
    if (isServerTool(toolName)) {
      return (
        <div className="adv-chat-tool-loading">
          <span className="adv-chat-tool-spinner" />
          <span>{getToolLoadingLabel(toolName)}</span>
        </div>
      );
    }

    // Client tools: wait until all args are available (not still streaming)
    if (part.state === "input-streaming") {
      return (
        <div className="adv-chat-tool-loading">
          <span className="adv-chat-tool-spinner" />
        </div>
      );
    }

    // Client-rendered tool — render the interactive component
    const handleResult = (result: unknown) => {
      onToolResult?.(toolCallId, toolName, result);
    };

    return renderClientTool(toolName, args as Record<string, unknown>, handleResult);
  }

  return null;
}

function renderClientTool(
  toolName: string,
  args: Record<string, unknown>,
  onResult: (result: unknown) => void
) {
  switch (toolName) {
    case "show_option_cards":
      return (
        <ChatOptionCards
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          options={args.options as { value: string; label: string; description?: string }[]}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_multi_select":
      return (
        <ChatMultiSelect
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          options={args.options as { value: string; label: string; description?: string }[]}
          maxSelections={args.maxSelections as number | undefined}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_ranking":
      return (
        <ChatRankingWidget
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          options={args.options as { value: string; label: string; description?: string }[]}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_allocation_sliders":
      return (
        <ChatAllocationSliders
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          categories={args.categories as { value: string; label: string }[]}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_slider":
      return (
        <ChatSliderInput
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          options={args.options as { value: string; label: string }[]}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_currency_input":
      return (
        <ChatCurrencyInput
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          placeholder={args.placeholder as string | undefined}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_free_text":
      return (
        <ChatFreeTextInline
          questionId={args.questionId as string}
          questionText={args.questionText as string}
          placeholder={args.placeholder as string | undefined}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_action_cards":
      return (
        <ChatActionCards
          actions={args.actions as { order: number; type: string; title: string; what: string; timeline?: string }[]}
          prompt={args.prompt as string | undefined}
          onSelect={(value) => onResult(value)}
        />
      );

    case "show_roadmap_summary":
      return (
        <ChatRoadmapSummary
          stage={args.stage as number}
          stageName={args.stageName as string}
          stageDescription={args.stageDescription as string}
          transitionReadiness={args.transitionReadiness as string}
          misalignments={args.misalignments as { flag: string; whatItsCosting: string }[]}
          actions={args.actions as { order: number; type: string; title: string; what: string; timeline?: string }[]}
          vision={args.vision as { twelveMonthTarget: string; threeYearHorizon: string } | undefined}
          onSelect={(value) => onResult(value)}
        />
      );

    default:
      return (
        <div className="adv-chat-tool-unknown">
          Unknown component: {toolName}
        </div>
      );
  }
}

function renderDisplayTool(toolName: string, args: Record<string, unknown>) {
  const noop = () => {};
  switch (toolName) {
    case "show_bar_chart":
      return (
        <ChatBarChart
          title={args.title as string | undefined}
          rows={args.rows as { label: string; value: string; pct: number }[]}
          onReady={noop}
        />
      );
    case "show_entity_chart":
      return (
        <ChatEntityChart
          title={args.title as string | undefined}
          parent={args.parent as string}
          children={args.children as { name: string; desc: string }[]}
          onReady={noop}
        />
      );
    case "show_metrics":
      return (
        <ChatMetrics
          metrics={args.metrics as { value: string; label: string }[]}
          onReady={noop}
        />
      );
    case "show_data_table":
      return (
        <ChatDataTable
          title={args.title as string | undefined}
          headers={args.headers as string[]}
          rows={args.rows as string[][]}
          onReady={noop}
        />
      );
    case "show_radar_chart":
      return (
        <ChatRadarChart
          title={args.title as string | undefined}
          dimensions={args.dimensions as { key: string; label: string; score: number }[]}
          onReady={noop}
        />
      );
    case "show_flywheel":
      return (
        <ChatFlywheel
          title={args.title as string | undefined}
          center={args.center as string | undefined}
          steps={args.steps as { label: string; detail?: string }[]}
          onReady={noop}
        />
      );
    default:
      return null;
  }
}

function renderCollapsedResult(toolName: string, result: unknown) {
  // Server tools show nothing when complete
  if (isServerTool(toolName)) return null;

  // Client tools show a collapsed summary of the user's selection
  const label = typeof result === "string"
    ? result
    : Array.isArray(result)
    ? result.join(", ")
    : typeof result === "object" && result
    ? JSON.stringify(result)
    : String(result);

  return <CollapsedResponse label={label} toolName={toolName} />;
}

function isServerTool(toolName: string): boolean {
  const serverTools = [
    "save_assessment_answer",
    "compute_stage_score",
    "match_archetype",
    "create_assessment",
    "generate_roadmap",
    "search_library",
    "get_structure_detail",
    "mark_action_status",
    "get_adaptive_questions",
  ];
  return serverTools.includes(toolName);
}

function getToolLoadingLabel(toolName: string): string {
  const labels: Record<string, string> = {
    save_assessment_answer: "Saving...",
    compute_stage_score: "Computing your stage...",
    match_archetype: "Matching your profile...",
    create_assessment: "Setting up...",
    generate_roadmap: "Generating your roadmap...",
    search_library: "Searching library...",
    get_structure_detail: "Loading structure...",
    mark_action_status: "Updating...",
    get_adaptive_questions: "Loading questions...",
  };
  return labels[toolName] || "Processing...";
}

/** Find the next client tool part after the given index, skipping server tools */
function findNextClientTool(
  parts: UIMessagePart<any, any>[],
  afterIdx: number
): boolean {
  for (let i = afterIdx + 1; i < parts.length; i++) {
    const p = parts[i];
    if (isToolUIPart(p)) {
      const name = getToolName(p);
      // Only client tools (show_*) should trigger bold question text
      if (!isServerTool(name)) return true;
      // Server tools are invisible — keep looking
      continue;
    }
    // Hit another text part before a client tool — don't bold
    if (p.type === "text") return false;
  }
  return false;
}
