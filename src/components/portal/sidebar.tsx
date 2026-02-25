"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalShell } from "./portal-shell-context";
import {
  DashboardIcon,
  StructuresIcon,
  CaseStudiesIcon,
  GuidesIcon,
  ThesisIcon,
  ArticlesIcon,
  SavedIcon,
  SettingsIcon,
  AssessmentIcon,
  AiAdvisorIcon,
  CommunityIcon,
  CloseIcon,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const LIBRARY_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
];

const LIBRARY_SUB_ITEMS: NavItem[] = [
  { href: "/library/structures", label: "Structures", icon: <StructuresIcon /> },
  { href: "/library/case-studies", label: "Case Studies", icon: <CaseStudiesIcon /> },
  { href: "/guides", label: "Guides", icon: <GuidesIcon /> },
  { href: "/library/articles", label: "Articles", icon: <ArticlesIcon /> },
];

const PERSONAL_ITEMS: NavItem[] = [
  { href: "/saved", label: "Saved", icon: <SavedIcon /> },
];

const COMING_SOON: NavItem[] = [
  { href: "#", label: "Assessment", icon: <AssessmentIcon />, disabled: true },
  { href: "#", label: "AI Advisor", icon: <AiAdvisorIcon />, disabled: true },
  { href: "#", label: "Community", icon: <CommunityIcon />, disabled: true },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function PortalSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = usePortalShell();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
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
          In Sequence <span>·</span> Library
        </div>

        {/* Library section */}
        <div className="sb-section">
          {LIBRARY_ITEMS.map((item) => (
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
          <div className="sb-sub">
            {LIBRARY_SUB_ITEMS.map((item) => (
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
        </div>

        <div className="sb-divider" />

        {/* Personal */}
        <div className="sb-section">
          {PERSONAL_ITEMS.map((item) => (
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

        <div className="sb-divider" />

        {/* Coming Soon */}
        <div className="sb-section">
          <div className="sb-section-label">Coming Soon</div>
          {COMING_SOON.map((item) => (
            <div
              key={item.label}
              className="sb-nav-item"
              style={{ opacity: 0.4, cursor: "default" }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        {/* Bottom */}
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
