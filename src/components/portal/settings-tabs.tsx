"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SettingsForm from "@/components/portal/settings-form";
import CreativeIdentityPanel from "@/components/portal/creative-identity-panel";
import type { CreativeIdentitySnapshot } from "@/types/creative-identity";

type TabId = "profile" | "creative-identity";

interface Props {
  activeTab: TabId;
  creativeIdentity: CreativeIdentitySnapshot;
}

export default function SettingsTabs({ activeTab, creativeIdentity }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>(activeTab);

  const switchTab = useCallback(
    (next: TabId) => {
      if (next === tab) return;
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "profile") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const qs = params.toString();
      router.replace(qs ? `/settings?${qs}` : "/settings", { scroll: false });
    },
    [tab, router, searchParams]
  );

  return (
    <div className="set-wrap">
      <div className="set-tabs" role="tablist" aria-label="Settings tabs">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={`set-tab${tab === "profile" ? " set-tab--active" : ""}`}
          onClick={() => switchTab("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "creative-identity"}
          className={`set-tab${
            tab === "creative-identity" ? " set-tab--active" : ""
          }`}
          onClick={() => switchTab("creative-identity")}
        >
          Creative Identity
          {creativeIdentity.status === "in_progress" && (
            <span className="set-tab-dot" aria-label="In progress" />
          )}
        </button>
      </div>

      <div className="set-tab-panel" role="tabpanel">
        {tab === "profile" ? (
          <SettingsForm />
        ) : (
          <CreativeIdentityPanel snapshot={creativeIdentity} />
        )}
      </div>
    </div>
  );
}
