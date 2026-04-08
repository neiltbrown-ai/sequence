import { createAdminClient } from "@/lib/supabase/admin";
import type { AdvisorMode, InitialPath, ConversationContextSnapshot } from "@/types/advisor";

/**
 * Create a new conversation record.
 */
export async function createConversation(
  userId: string,
  initialPath?: InitialPath,
  mode?: AdvisorMode
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_conversations")
    .insert({
      user_id: userId,
      initial_path: initialPath || null,
      current_mode: mode || "explore",
      modes_used: mode ? [mode] : [],
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create conversation: ${error?.message}`);
  }

  return data.id as string;
}

/**
 * Load a conversation by ID (for the owning user).
 */
export async function loadConversation(conversationId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Save messages to a conversation. Replaces the full messages array.
 * Also updates metadata: last_message_at, message_count, current_mode, modes_used.
 */
export async function saveConversationMessages(
  conversationId: string,
  messages: unknown[],
  mode: AdvisorMode,
  snapshot?: ConversationContextSnapshot
) {
  const admin = createAdminClient();

  // Get existing modes_used to append
  const { data: existing } = await admin
    .from("ai_conversations")
    .select("modes_used")
    .eq("id", conversationId)
    .single();

  const modesUsed = existing?.modes_used || [];
  if (!modesUsed.includes(mode)) {
    modesUsed.push(mode);
  }

  const { error } = await admin
    .from("ai_conversations")
    .update({
      messages: messages,
      message_count: messages.length,
      current_mode: mode,
      modes_used: modesUsed,
      last_message_at: new Date().toISOString(),
      context_snapshot: snapshot || null,
    })
    .eq("id", conversationId);

  if (error) {
    console.error("Failed to save conversation messages:", error);
  }
}

/**
 * Link an assessment to a conversation.
 */
export async function linkAssessmentToConversation(
  conversationId: string,
  assessmentId: string
) {
  const admin = createAdminClient();
  await admin
    .from("ai_conversations")
    .update({ assessment_id: assessmentId })
    .eq("id", conversationId);
}

/**
 * Link an action to a conversation (for action coaching).
 */
export async function linkActionToConversation(
  conversationId: string,
  actionId: string
) {
  const admin = createAdminClient();
  await admin
    .from("ai_conversations")
    .update({ action_id: actionId })
    .eq("id", conversationId);
}

/**
 * List recent conversations for a user.
 */
export async function listConversations(
  userId: string,
  limit = 20,
  offset = 0
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_conversations")
    .select("id, title, started_at, last_message_at, current_mode, initial_path, message_count, is_archived")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return [];
  }

  return data || [];
}

/**
 * Archive a conversation.
 */
export async function archiveConversation(conversationId: string) {
  const admin = createAdminClient();
  await admin
    .from("ai_conversations")
    .update({ is_archived: true })
    .eq("id", conversationId);
}

/**
 * Rename a conversation.
 */
export async function renameConversation(conversationId: string, title: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_conversations")
    .update({ title })
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to rename conversation: ${error.message}`);
  }
}

/**
 * Delete a conversation permanently.
 */
export async function deleteConversation(conversationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
}
