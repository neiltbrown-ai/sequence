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
  const { messages: uiMessages, data: metadata } = body as {
    messages: UIMessage[];
    data?: {
      conversationId?: string;
      mode?: AdvisorMode;
      snapshot?: ConversationContextSnapshot;
    };
  };

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

  // Sanitize messages — strip tool calls with missing/invalid input (from timed-out responses)
  const sanitizedMessages = uiMessages.map((msg) => {
    if (msg.role !== "assistant" || !msg.parts) return msg;
    const cleanParts = msg.parts.filter((p: any) => {
      if (p.type?.startsWith("tool-") && p.toolCallId) {
        // Remove tool calls with undefined/null/non-object input
        if (!p.input || typeof p.input !== "object") return false;
      }
      return true;
    });
    return { ...msg, parts: cleanParts };
  });

  // Convert UI messages to model messages for streamText
  // ignoreIncompleteToolCalls strips input-available/input-streaming tool parts
  // that have no result yet — prevents unmatched tool_use error from Anthropic
  const modelMessages = await convertToModelMessages(sanitizedMessages, { tools, ignoreIncompleteToolCalls: true });

  // Stream the response
  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10), // Allow multi-step tool flows (especially assessment completion)
    onFinish: async ({ response }) => {
      try {
        // Save metadata/snapshot (client saves UIMessages separately)
        await saveConversationMessages(
          conversationId!,
          [...uiMessages, ...response.messages],
          mode,
          snapshot
        );

        // If an assessment was created during this conversation, link it
        if (snapshot?.assessmentId) {
          await linkAssessmentToConversation(
            conversationId!,
            snapshot.assessmentId
          );
        }

        // Auto-generate title from first user message on new conversations
        if (isNewConversation) {
          const firstUserMsg = uiMessages.find((m) => m.role === "user");
          if (firstUserMsg) {
            const textPart = firstUserMsg.parts?.find(
              (p) => p.type === "text"
            );
            if (textPart && "text" in textPart) {
              let title = textPart.text.trim();
              if (title.length > 60) {
                title = title.substring(0, 60).replace(/\s\S*$/, "...");
              }
              const admin = createAdminClient();
              await admin
                .from("ai_conversations")
                .update({ title })
                .eq("id", conversationId!);
            }
          }
        }
      } catch (err) {
        console.error("Failed to persist conversation:", err);
      }
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "X-Conversation-Id": conversationId,
    },
  });
}
