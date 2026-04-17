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

// Nav flow reads as the member's journey:
//   Dashboard → Portfolio (input) → Roadmap (output) → Evaluate (ongoing
//   input that refreshes Roadmap) → Advisor (conversational layer over all)
const TOP_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/inventory", label: "Portfolio", icon: <InventoryIcon />, requiredTier: "full_access" },
  { href: "/roadmap", label: "Roadmap", icon: <RoadmapIcon />, requiredTier: "full_access" },
  { href: "/evaluate", label: "Evaluate", icon: <EvaluateIcon />, requiredTier: "full_access" },
  { href: "/advisor", label: "Advisor", icon: <AiAdvisorIcon />, requiredTier: "full_access" },
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

function CollapseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="14" height="14">
      <path d="M10 3L5 8L10 13" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" width="14" height="14">
      <path d="M6 3L11 8L6 13" />
    </svg>
  );
}

export default function PortalSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleCollapsed, hasActiveSubscription, accessTier } = usePortalShell();

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
          {!sidebarCollapsed && <span className="sb-nav-label">{item.label}</span>}
        </div>
      );
    }
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`sb-nav-item${isActive(item.href) ? " active" : ""}`}
        title={sidebarCollapsed ? item.label : undefined}
        onClick={(e) => {
          closeSidebar();
          if (item.href === "/advisor" && pathname.startsWith("/advisor")) {
            e.preventDefault();
            window.location.href = "/advisor";
          }
        }}
      >
        {item.icon}
        {!sidebarCollapsed && <span className="sb-nav-label">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />
      <aside className={`sidebar${sidebarOpen ? " open" : ""}${sidebarCollapsed ? " collapsed" : ""}`}>
        <button className="sb-close" onClick={closeSidebar}>
          <CloseIcon />
        </button>

        <div className="sb-logo-row">
          {!sidebarCollapsed && <div className="sb-logo">Sequence</div>}
          <button
            type="button"
            className="sb-collapse-btn"
            onClick={toggleCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>

        {/* Top: Dashboard + Tools */}
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
