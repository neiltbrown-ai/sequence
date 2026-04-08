import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listConversations,
  createConversation,
  renameConversation,
  deleteConversation,
} from "@/lib/advisor/message-store";
import type { AdvisorMode, InitialPath } from "@/types/advisor";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const conversations = await listConversations(user.id, limit, offset);

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { initialPath, mode } = body as {
    initialPath?: InitialPath;
    mode?: AdvisorMode;
  };

  const conversationId = await createConversation(
    user.id,
    initialPath,
    mode
  );

  return NextResponse.json({ conversationId });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, title } = body as {
    conversationId: string;
    title: string;
  };

  if (!conversationId || !title?.trim()) {
    return NextResponse.json({ error: "Missing conversationId or title" }, { status: 400 });
  }

  try {
    await renameConversation(conversationId, title.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rename failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const conversationId = url.searchParams.get("id");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
  }

  try {
    await deleteConversation(conversationId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
