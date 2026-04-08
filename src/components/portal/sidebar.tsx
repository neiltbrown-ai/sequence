"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalShell } from "./portal-shell-context";
import {
  DashboardIcon,
  StructuresIcon,
  CaseStudiesIcon,
  ArticlesIcon,
  SavedIcon,
  SettingsIcon,
  AiAdvisorIcon,
  RoadmapIcon,
  InventoryIcon,
  EvaluateIcon,
  CommunityIcon,
  CloseIcon,
} from "./icons";
import type { AccessTier } from "@/lib/plans";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  /** Minimum tier required. Omit for no restriction. */
  requiredTier?: AccessTier;
}

const TOP_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/advisor", label: "Advisor", icon: <AiAdvisorIcon />, requiredTier: "full_access" },
  { href: "/roadmap", label: "Roadmap", icon: <RoadmapIcon />, requiredTier: "full_access" },
  { href: "/evaluate", label: "Evaluate", icon: <EvaluateIcon />, requiredTier: "full_access" },
  { href: "/inventory", label: "Inventory", icon: <InventoryIcon />, requiredTier: "full_access" },
];

const MIDDLE_ITEMS: NavItem[] = [
  { href: "/saved", label: "Saved", icon: <SavedIcon />, requiredTier: "library" },
  { href: "#", label: "Community", icon: <CommunityIcon />, disabled: true },
];

const LIBRARY_ITEMS: NavItem[] = [
  { href: "/library/articles", label: "Articles", icon: <ArticlesIcon />, requiredTier: "library" },
  { href: "/library/case-studies", label: "Case Studies", icon: <CaseStudiesIcon />, requiredTier: "library" },
  { href: "/library/structures", label: "Structures", icon: <StructuresIcon />, requiredTier: "library" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

const TIER_RANK: Record<AccessTier, number> = {
  library: 1,
  full_access: 2,
  coaching: 3,
};

export default function PortalSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar, hasActiveSubscription, accessTier } = usePortalShell();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const isLocked =
      item.disabled ||
      (!hasActiveSubscription && item.requiredTier) ||
      (item.requiredTier && TIER_RANK[accessTier] < TIER_RANK[item.requiredTier]);

    if (isLocked) {
      return (
        <div
          key={item.label}
          className="sb-nav-item"
          style={{ opacity: 0.4, cursor: "default" }}
          title={item.disabled ? "Coming soon" : "Upgrade to access"}
        >
          {item.icon}
          {item.label}
        </div>
      );
    }
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sb-nav-item${isActive(item.href) ? " active" : ""}`}
        onClick={(e) => {
          closeSidebar();
          // Force full page reload for advisor when already on /advisor
          // (client state doesn't reset on same-URL navigation)
          if (item.href === "/advisor" && pathname.startsWith("/advisor")) {
            e.preventDefault();
            window.location.href = "/advisor";
          }
        }}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <button className="sb-close" onClick={closeSidebar}>
          <CloseIcon />
        </button>

        <div className="sb-logo">
          In Sequence <span>·</span> Library
        </div>

        {/* Top: Dashboard + AI tools */}
        <div className="sb-section">
          {TOP_ITEMS.map(renderNavItem)}
        </div>

        <div className="sb-divider" />

        {/* Middle: Saved + Community */}
        <div className="sb-section">
          {MIDDLE_ITEMS.map(renderNavItem)}
        </div>

        <div className="sb-divider" />

        {/* Library */}
        <div className="sb-section">
          {LIBRARY_ITEMS.map(renderNavItem)}
        </div>

        {/* Bottom */}
        <div className="sb-bottom">
          <div className="sb-divider" />
          {BOTTOM_ITEMS.map(renderNavItem)}
        </div>
      </aside>
    </>
  );
}
