import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdvisorMode } from "@/types/advisor";

/**
 * POST /api/advisor/conversations/save
 * Saves UIMessage[] from the client (correct format for restoration).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, messages, mode } = body as {
    conversationId: string;
    messages: unknown[];
    mode?: AdvisorMode;
  };

  if (!conversationId || !messages) {
    return NextResponse.json({ error: "Missing conversationId or messages" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify the conversation belongs to this user
  const { data: conv } = await admin
    .from("ai_conversations")
    .select("user_id")
    .eq("id", conversationId)
    .single();

  if (!conv || conv.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update modes_used if mode provided
  let modesUpdate = {};
  if (mode) {
    const { data: existing } = await admin
      .from("ai_conversations")
      .select("modes_used")
      .eq("id", conversationId)
      .single();

    const modesUsed = existing?.modes_used || [];
    if (!modesUsed.includes(mode)) {
      modesUsed.push(mode);
    }
    modesUpdate = { current_mode: mode, modes_used: modesUsed };
  }

  const { error } = await admin
    .from("ai_conversations")
    .update({
      messages,
      message_count: messages.length,
      last_message_at: new Date().toISOString(),
      ...modesUpdate,
    })
    .eq("id", conversationId);

  if (error) {
    console.error("Failed to save conversation messages:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
