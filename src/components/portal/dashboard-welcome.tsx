"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

interface DashboardWelcomeProps {
  /** True when the member has an active strategic plan — the sub-line
      states position plainly instead of pointing at the first step. */
  hasPlan?: boolean;
}

export default function DashboardWelcome({ hasPlan = false }: DashboardWelcomeProps) {
  const [firstName, setFirstName] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Computed client-side (member's local clock), post-hydration to avoid
    // a server/client time mismatch.
    setGreeting(getGreeting());

    async function loadName() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Try user_metadata first (set during signup)
      const metaFirst = user.user_metadata?.first_name;
      if (metaFirst) {
        setFirstName(metaFirst);
        return;
      }

      // Fall back to profile full_name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setFirstName(profile.full_name.split(" ")[0]);
      }
    }

    loadName();
  }, []);

  return (
    <div className="welcome rv">
      <div className="welcome-left">
        <div className="welcome-name">
          {greeting ? `${greeting}${firstName ? `, ${firstName}` : ""}.` : " "}
        </div>
        <div className="welcome-context">
          {hasPlan ? "Here's where things stand." : "Here's where to start."}
        </div>
      </div>
      <div className="welcome-right">
        <Link href="/library/structures" className="welcome-continue">
          Browse Structures
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={10} height={10}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
