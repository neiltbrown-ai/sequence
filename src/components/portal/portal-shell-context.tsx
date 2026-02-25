"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface PortalShellContextValue {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const PortalShellContext = createContext<PortalShellContextValue | null>(null);

export function PortalShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  return (
    <PortalShellContext.Provider
      value={{ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }}
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
