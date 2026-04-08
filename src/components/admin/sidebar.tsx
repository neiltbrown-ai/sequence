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

const AdminSettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

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

export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = usePortalShell();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
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
          In Sequence <span>·</span> Admin
        </div>

        <div className="sb-section">
          {ADMIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-nav-item${isActive(item.href) ? " active" : ""}`}
              onClick={closeSidebar}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sb-bottom">
          <div className="sb-divider" />
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sb-nav-item${isActive(item.href) ? " active" : ""}`}
              onClick={closeSidebar}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
