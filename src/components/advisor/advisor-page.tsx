"use client";

import { useState } from "react";
import AdvisorState1 from "./advisor-state-1";
import type { AdvisorPageProps, AdvisorMode } from "@/types/advisor";

export default function AdvisorPage({
  memberContext,
  existingConversationId,
  initialMessages,
  conversations,
}: AdvisorPageProps) {
  const [, setCurrentMode] = useState<AdvisorMode>("explore");

  return (
    <AdvisorState1
      memberContext={memberContext}
      conversationId={existingConversationId}
      initialMessages={initialMessages}
      conversations={conversations}
      onModeChange={setCurrentMode}
    />
  );
}
