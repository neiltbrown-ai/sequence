"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AccessTier } from "@/lib/plans";

interface PortalShellContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  hasActiveSubscription: boolean;
  accessTier: AccessTier;
}

const PortalShellContext = createContext<PortalShellContextValue | null>(null);

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

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <PortalShellContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar, toggleSidebar, hasActiveSubscription, accessTier }}
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
