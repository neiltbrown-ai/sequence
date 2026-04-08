import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildMemberContext, loadLatestConversation } from "@/lib/advisor/context-builder";
import { listConversations } from "@/lib/advisor/message-store";
import AdvisorPage from "@/components/advisor/advisor-page";
import type { ConversationSummary } from "@/types/advisor";

export default async function AdvisorPageRoute() {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load member context + conversations in parallel
  const [memberContext, conversations] = await Promise.all([
    buildMemberContext(user.id),
    listConversations(user.id, 20, 0),
  ]);

  // Load latest conversation's messages for restoration
  const latestConversation = await loadLatestConversation(user.id);
  const existingConversationId = latestConversation?.id || undefined;
  const initialMessages = (latestConversation?.messages as unknown[]) || undefined;

  return (
    <AdvisorPage
      memberContext={memberContext}
      existingConversationId={existingConversationId}
      initialMessages={initialMessages}
      conversations={(conversations as ConversationSummary[]) || []}
    />
  );
}
