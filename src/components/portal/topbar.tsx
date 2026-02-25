"use client";

import Link from "next/link";
import { usePortalShell } from "./portal-shell-context";
import { SearchIcon } from "./icons";

export default function PortalTopbar() {
  const { openSidebar } = usePortalShell();

  return (
    <header className="topbar">
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={openSidebar}>
          <span /><span /><span />
        </button>
      </div>

      <div className="tb-search">
        <SearchIcon />
        <input
          type="text"
          className="tb-search-input"
          placeholder="Search structures, cases, guides…"
        />
      </div>

      <div className="tb-right">
        <Link href="/dashboard" className="tb-new-badge">
          <span className="tb-new-dot" />
          3 New this week
        </Link>
        <Link href="/settings" className="tb-avatar">
          NB
        </Link>
      </div>
    </header>
  );
}
