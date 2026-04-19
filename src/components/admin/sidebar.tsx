"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalShell } from "../portal/portal-shell-context";
import {
  OverviewIcon,
  MembersIcon,
  AssessmentIcon,
  DiscountIcon,
  NewsletterIcon,
  AiAdvisorIcon,
  BackIcon,
  SettingsIcon,
  CloseIcon,
} from "../portal/icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <OverviewIcon /> },
  { href: "/admin/members", label: "Members", icon: <MembersIcon /> },
  { href: "/admin/assessments", label: "Assessments", icon: <AssessmentIcon /> },
  { href: "/admin/codes", label: "Codes", icon: <DiscountIcon /> },
  { href: "/admin/ai", label: "AI & Config", icon: <AiAdvisorIcon /> },
  { href: "/admin/newsletter", label: "Newsletter", icon: <NewsletterIcon /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Back to Site", icon: <BackIcon /> },
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

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

/**
 * Admin sidebar — matches the portal sidebar pattern (logo row with
 * collapse toggle, icon-only rail when collapsed, label spans when
 * expanded). Reuses the same CSS classes (.sidebar, .sb-*) + shared
 * portal-shell context for collapse state.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleCollapsed } =
    usePortalShell();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href}
      href={item.href}
      className={`sb-nav-item${isActive(item.href) ? " active" : ""}`}
      title={sidebarCollapsed ? item.label : undefined}
      onClick={closeSidebar}
    >
      {item.icon}
      {!sidebarCollapsed && <span className="sb-nav-label">{item.label}</span>}
    </Link>
  );

  return (
    <>
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />
      <aside
        className={`sidebar${sidebarOpen ? " open" : ""}${sidebarCollapsed ? " collapsed" : ""}`}
      >
        <button className="sb-close" onClick={closeSidebar}>
          <CloseIcon />
        </button>

        <div className="sb-logo-row">
          {!sidebarCollapsed && <div className="sb-logo">Admin</div>}
          <button
            type="button"
            className="sb-collapse-btn"
            onClick={toggleCollapsed}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>

        <div className="sb-section">{ADMIN_ITEMS.map(renderNavItem)}</div>

        <div className="sb-bottom">
          <div className="sb-divider" />
          {BOTTOM_ITEMS.map(renderNavItem)}
        </div>
      </aside>
    </>
  );
}
