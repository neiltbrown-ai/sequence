"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MESSAGES = [
  "Your personalized library — structures, case studies, and frameworks tailored to where you are.",
  "New structures and case studies added weekly. The library keeps growing with you.",
  "The creative economy is restructuring. You're building the leverage to navigate it.",
  "Every deal structure here started with a practitioner. Real terms, real outcomes.",
  "Ownership compounds. The structures you learn today shape the deals you negotiate tomorrow.",
];

function getRotatingMessage(): string {
  // Rotate daily based on day-of-year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return MESSAGES[dayOfYear % MESSAGES.length];
}

export default function DashboardWelcome() {
  const [firstName, setFirstName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(getRotatingMessage());

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
        <div className="welcome-context">{message}</div>
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
