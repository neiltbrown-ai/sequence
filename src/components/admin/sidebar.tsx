"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalShell } from "../portal/portal-shell-context";
import {
  OverviewIcon,
  MembersIcon,
  FlaggedIcon,
  UniversityIcon,
  DiscountIcon,
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
