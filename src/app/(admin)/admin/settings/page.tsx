"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/ai");
  }, [router]);

  return (
    <div className="adm-header rv vis">
      <p className="adm-subtitle">Redirecting to AI & Configuration...</p>
    </div>
  );
}
