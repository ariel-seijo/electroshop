"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SidebarContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !prev),
    []
  );
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar debe usarse dentro de <SidebarProvider>");
  }
  return ctx;
}
