"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const signOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    };
    signOut();
  }, [router]);

  return (
    <>
      <div className="auth-logo">
        In Sequence <span>·</span> Member
      </div>

      <div className="auth-card" style={{ textAlign: "center" }}>
        <p className="auth-subtitle" style={{ marginBottom: 0 }}>
          Signing you out…
        </p>
      </div>
    </>
  );
}
