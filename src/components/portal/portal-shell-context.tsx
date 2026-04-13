"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AccessTier } from "@/lib/plans";

interface PortalShellContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  toggleCollapsed: () => void;
  hasActiveSubscription: boolean;
  accessTier: AccessTier;
}

const PortalShellContext = createContext<PortalShellContextValue | null>(null);

const COLLAPSED_KEY = "seq-sidebar-collapsed";

export function PortalShellProvider({
  children,
  hasActiveSubscription = true,
  accessTier = "library",
}: {
  children: ReactNode;
  hasActiveSubscription?: boolean;
  accessTier?: AccessTier;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore collapsed preference from localStorage + sync CSS variable
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSED_KEY);
    if (saved === "true") {
      setSidebarCollapsed(true);
      document.documentElement.style.setProperty("--sidebar-w", "60px");
    }
  }, []);

  // Sync CSS variable when collapsed state changes
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", sidebarCollapsed ? "60px" : "248px");
  }, [sidebarCollapsed]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <PortalShellContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar, toggleSidebar, sidebarCollapsed, toggleCollapsed, hasActiveSubscription, accessTier }}
    >
      {children}
    </PortalShellContext.Provider>
  );
}

export function usePortalShell() {
  const ctx = useContext(PortalShellContext);
  if (!ctx) throw new Error("usePortalShell must be used within PortalShellProvider");
  return ctx;
}
