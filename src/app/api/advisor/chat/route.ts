import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { buildMemberContext } from "@/lib/advisor/context-builder";
import { buildSystemPrompt } from "@/lib/advisor/system-prompts";
import { getAdvisorTools } from "@/lib/advisor/tools";
import {
  createConversation,
  saveConversationMessages,
  linkAssessmentToConversation,
} from "@/lib/advisor/message-store";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdvisorMode, ConversationContextSnapshot } from "@/types/advisor";

export const maxDuration = 120;

/**
 * A persisted history row is only safe to feed to `convertToModelMessages` if every
 * entry is a real UIMessage: a user/assistant/system role with a `parts` array.
 *
 * Historically the route's onFinish saved `[...uiMessages, ...response.messages]`, and
 * `response.messages` are ModelMessages (role "tool", `content` instead of `parts`).
 * Those rows crash conversion on reload (`parts` is undefined → AI_MessageConversionError).
 * We also expect format drift from AI SDK upgrades and tool-schema changes over time.
 * `normalizeUiMessages` drops anything that isn't a UIMessage and strips tool parts with
 * non-object input (left behind by timed-out responses).
 */
function isUiMessage(m: unknown): m is UIMessage {
  const msg = m as { role?: unknown; parts?: unknown } | null;
  return (
    !!msg &&
    (msg.role === "user" || msg.role === "assistant" || msg.role === "system") &&
    Array.isArray(msg.parts)
  );
}

function normalizeUiMessages(input: unknown): UIMessage[] {
  const arr = Array.isArray(input) ? input : [];
  return arr.filter(isUiMessage).map((msg) => {
    if (msg.role !== "assistant") return msg;
    const cleanParts = msg.parts.filter((p: { type?: string; toolCallId?: string; input?: unknown }) => {
      if (p?.type?.startsWith("tool-") && p.toolCallId) {
        // Remove tool calls with undefined/null/non-object input
        if (!p.input || typeof p.input !== "object") return false;
      }
      return true;
    });
    return { ...msg, parts: cleanParts };
  });
}

/**
 * Convert UI messages to model messages with graceful degradation. Normalization fixes
 * every shape we know about today; the try/catch is the standing guard against future
 * AI SDK / tool-schema drift — it degrades the turn to text-only rather than 500ing.
 */
async function toModelMessagesResilient(
  messages: UIMessage[],
  tools: ReturnType<typeof getAdvisorTools>
) {
  try {
    return await convertToModelMessages(messages, { tools, ignoreIncompleteToolCalls: true });
  } catch (err) {
    console.error("advisor: convertToModelMessages failed, degrading to text-only", err);
    // Drop all tool parts; keep only text. Rebuilds a clean text-only transcript.
    const textOnly = messages
      .map((m) => ({
        ...m,
        parts: (m.parts || []).filter((p: { type?: string }) => p?.type === "text"),
      }))
      .filter((m) => m.parts.length > 0) as UIMessage[];
    try {
      return await convertToModelMessages(textOnly, { ignoreIncompleteToolCalls: true });
    } catch (err2) {
      console.error("advisor: text-only convert also failed, using last user turn", err2);
      // Last resort: just the most recent user message so the turn still proceeds.
      const lastUser = [...textOnly].reverse().find((m) => m.role === "user");
      return lastUser ? await convertToModelMessages([lastUser]) : [];
    }
  }
}

export async function POST(request: Request) {
  // Use SEQ_ prefix to avoid collision with Claude Code shell env vars
  const anthropic = createAnthropic({
    apiKey: process.env.SEQ_ANTHROPIC_API_KEY,
    baseURL: process.env.SEQ_ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1",
  });

  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { messages: rawMessages, data: metadata } = body as {
    messages: UIMessage[];
    data?: {
      conversationId?: string;
      mode?: AdvisorMode;
      snapshot?: ConversationContextSnapshot;
    };
  };

  // Normalize the incoming history once. This is BOTH the read guard (safe to convert)
  // AND the canonical write set (`originalMessages` below persists from this), so any
  // corrupted entries the client re-sent get cleaned on the next save (self-healing).
  const uiMessages = normalizeUiMessages(rawMessages);

  // Determine mode and conversation context
  const mode: AdvisorMode = metadata?.mode || "explore";
  const snapshot = metadata?.snapshot;

  // Build member context
  const memberContext = await buildMemberContext(user.id);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(memberContext, mode, snapshot);

  // Get tools
  const tools = getAdvisorTools();

  // Ensure conversation exists
  let conversationId = metadata?.conversationId;
  let isNewConversation = false;
  if (!conversationId) {
    conversationId = await createConversation(user.id, undefined, mode);
    isNewConversation = true;
  }

  // Convert UI messages to model messages for streamText.
  // ignoreIncompleteToolCalls strips input-available/input-streaming tool parts that have
  // no result yet — prevents unmatched tool_use errors from Anthropic. The resilient
  // wrapper degrades gracefully if conversion still throws (future format drift).
  const modelMessages = await toModelMessagesResilient(uiMessages, tools);

  // Stream the response
  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10), // Allow multi-step tool flows (especially assessment completion)
  });

  // Persist via the UI-message stream: onFinish hands back the full UIMessage[] (original
  // turns + the new assistant response as proper UIMessages with `parts`). This is the
  // single canonical writer — the client no longer saves separately, so there's no race
  // and we never write ModelMessages into the history column again.
  return result.toUIMessageStreamResponse({
    originalMessages: uiMessages,
    headers: {
      "X-Conversation-Id": conversationId,
    },
    onError: (error) => {
      console.error("advisor: stream error", error);
      return "The response ran into a problem. Please try again.";
    },
    onFinish: async ({ messages }) => {
      try {
        await saveConversationMessages(conversationId!, user.id, messages, mode, snapshot);

        // If an assessment was created during this conversation, link it
        if (snapshot?.assessmentId) {
          await linkAssessmentToConversation(conversationId!, user.id, snapshot.assessmentId);
        }

        // Auto-generate title from first user message on new conversations
        if (isNewConversation) {
          const firstUserMsg = messages.find((m) => m.role === "user");
          const textPart = firstUserMsg?.parts?.find((p) => p.type === "text");
          if (textPart && "text" in textPart) {
            let title = textPart.text.trim();
            if (title.length > 60) {
              title = title.substring(0, 60).replace(/\s\S*$/, "...");
            }
            const admin = createAdminClient();
            await admin
              .from("ai_conversations")
              .update({ title })
              .eq("id", conversationId!)
              .eq("user_id", user.id);
          }
        }
      } catch (err) {
        console.error("Failed to persist conversation:", err);
      }
    },
  });
}
